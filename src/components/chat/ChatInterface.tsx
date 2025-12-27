'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Image as ImageIcon,
    MoreVertical,
    Search,
    ArrowLeft,
    Check,
    CheckCheck,
    Loader2,
    Smile,
    Paperclip,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDocs, limit, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    imageUrl?: string;
    senderId: string;
    createdAt: any;
    read: boolean;
}

interface Conversation {
    id: string;
    participants: string[];
    participantDetails?: any; // Hydrated user details
    lastMessage: string;
    lastMessageTime: any;
    unreadCount: number;
}

interface ChatInterfaceProps {
    currentUserRole: 'admin' | 'resident';
    currentUserId: string;
}

export function ChatInterface({ currentUserRole, currentUserId }: ChatInterfaceProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileShowChat, setMobileShowChat] = useState(false); // For mobile view navigation
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const initialConvId = searchParams.get('conversationId');

    // 1. Fetch Conversations
    useEffect(() => {
        if (!currentUserId) return;

        let q;
        if (currentUserRole === 'admin') {
            q = query(collection(db, 'conversations'));
        } else {
            // For resident, try to find their single conversation with admin/support
            // If it doesn't exist, we might need to create it on first message or check explicitly
            q = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUserId));
        }

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convs = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                // Hydrate other participant details for Admin
                let participantDetails = null;
                if (currentUserRole === 'admin') {
                    const otherId = data.participants.find((p: string) => p !== currentUserId);
                    if (otherId) {
                        // In a real app, cache this or use a separate users listener to avoid N+1 queries
                        const userSnap = await getDoc(doc(db, 'users', otherId));
                        if (userSnap.exists()) participantDetails = userSnap.data();
                    }
                }

                return {
                    id: docSnapshot.id,
                    ...data,
                    participantDetails
                } as Conversation;
            }));

            // Filter conversations for resident (should catch above via query but double check)
            // And also handle if resident has no conversation yet
            // Sort client-side
            convs.sort((a, b) => {
                const tA = a.lastMessageTime?.seconds || 0;
                const tB = b.lastMessageTime?.seconds || 0;
                return tB - tA;
            });
            setConversations(convs);

            // Auto-select for resident if only one
            if (currentUserRole === 'resident' && convs.length === 1 && !activeConversationId) {
                setActiveConversationId(convs[0].id);
                setMobileShowChat(true); // On mobile, maybe don't auto-show if we want them to see the list? 
                // Actually for resident, usually they just want to talk to "Support".
            }
        });

        return () => unsubscribe();
    }, [currentUserId, currentUserRole]);

    // 2. Fetch Messages for Active Conversation
    useEffect(() => {
        if (!activeConversationId) return;

        const q = query(
            collection(db, `conversations/${activeConversationId}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            scrollToBottom();
        });

        // Mark conversation as read when opened
        const markAsRead = async () => {
            try {
                const convRef = doc(db, 'conversations', activeConversationId);
                const convSnap = await getDoc(convRef);
                if (convSnap.exists()) {
                    const data = convSnap.data();
                    // Only reset if I'm not the last sender (meaning I have unread messages)
                    if (data.lastSenderId !== currentUserId && data.unreadCount > 0) {
                        await updateDoc(convRef, { unreadCount: 0 });
                    }
                }
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        };
        markAsRead();

        return () => unsubscribe();
    }, [activeConversationId, currentUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const createConversation = async () => {
        if (!currentUserId) return;
        setIsUploading(true);
        try {
            // Check if conversation already exists
            const q = query(
                collection(db, 'conversations'),
                where('participants', 'array-contains', currentUserId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setActiveConversationId(snapshot.docs[0].id);
                setMobileShowChat(true);
                return;
            }

            // Create new conversation
            const newConvRef = doc(collection(db, 'conversations'));
            await setDoc(newConvRef, {
                participants: [currentUserId, 'admin'],
                lastMessage: 'Nouvelle conversation',
                lastSenderId: currentUserId,
                lastMessageTime: serverTimestamp(),
                unreadCount: 0,
                createdAt: serverTimestamp()
            });

            setActiveConversationId(newConvRef.id);
            setMobileShowChat(true);
        } catch (error) {
            console.error("Error creating conversation:", error);
            toast.error("Erreur lors de la création de la conversation");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !isUploading) || !activeConversationId) return;

        try {
            const convId = activeConversationId;

            // Add message
            await addDoc(collection(db, `conversations/${convId}/messages`), {
                content: newMessage,
                senderId: currentUserId,
                createdAt: serverTimestamp(),
                read: false
            });

            // Update conversation last message
            await updateDoc(doc(db, 'conversations', convId), {
                lastMessage: newMessage,
                lastSenderId: currentUserId,
                lastMessageTime: serverTimestamp(),
                unreadCount: 1
            });

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Erreur d'envoi");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversationId) return;

        setIsUploading(true);
        try {
            // Upload to Vercel Blob via API route
            const response = await fetch(`/api/upload/chat?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });

            if (!response.ok) throw new Error('Upload failed');

            const blob = await response.json();

            // Send message with image
            await addDoc(collection(db, `conversations/${activeConversationId}/messages`), {
                content: 'Image envoyée',
                imageUrl: blob.url,
                senderId: currentUserId,
                createdAt: serverTimestamp(),
                read: false
            });

            await updateDoc(doc(db, 'conversations', activeConversationId), {
                lastMessage: '📷 Photo',
                lastSenderId: currentUserId,
                lastMessageTime: serverTimestamp(),
                unreadCount: 1
            });

        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Erreur lors de l'envoi de l'image. Vérifiez les clés Vercel Blob.");
        } finally {
            setIsUploading(false);
        }
    };

    // Filter conversations for search
    const filteredConversations = conversations.filter(c => {
        // Search by participant name (for admin)
        if (c.participantDetails) {
            const name = `${c.participantDetails.firstName} ${c.participantDetails.lastName}`.toLowerCase();
            return name.includes(searchTerm.toLowerCase());
        }
        return true;
    });

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-100px)] sm:h-[calc(100vh-120px)] w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Sidebar / Conversation List */}
            <div className={cn(
                "w-full md:w-72 lg:w-80 border-r border-gray-200 flex flex-col",
                mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 text-sm">Messages</h2>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => {
                                setActiveConversationId(conv.id);
                                setMobileShowChat(true);
                            }}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50",
                                activeConversationId === conv.id ? "bg-primary-50" : "hover:bg-gray-50"
                            )}
                        >
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium shrink-0">
                                {currentUserRole === 'admin' && conv.participantDetails ?
                                    (conv.participantDetails.firstName?.[0] || 'U') :
                                    <Shield className="h-4 w-4 text-gray-400" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 truncate text-sm">
                                        {currentUserRole === 'admin' ?
                                            (conv.participantDetails ? `${conv.participantDetails.firstName} ${conv.participantDetails.lastName}` : 'Inconnu') :
                                            'Administration'
                                        }
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {conv.lastMessageTime?.toDate ? conv.lastMessageTime.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />}
                        </div>
                    ))}

                    {filteredConversations.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-xs text-gray-400">Aucune discussion</p>
                            {currentUserRole === 'resident' && (
                                <button
                                    onClick={createConversation}
                                    className="mt-3 text-primary-600 text-xs font-medium hover:underline"
                                >
                                    Nouvelle conversation
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col bg-gray-50",
                !mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {activeConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-3 py-2.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <button
                                    className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setMobileShowChat(false)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                                    {currentUserRole === 'admin' ? 'U' : <Shield className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                        {currentUserRole === 'admin' ? 'Résident' : 'Administration'}
                                    </p>
                                    <p className="text-[10px] text-green-600">En ligne</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                    >
                                        <div className={cn(
                                            "max-w-[80%] px-3 py-1.5 text-sm rounded-2xl",
                                            isMe ? "bg-primary-600 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
                                        )}>
                                            {msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="" className="max-w-full rounded-lg mb-1.5" />
                                            )}
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <p className={cn("text-[9px] mt-0.5 text-right", isMe ? "text-white/70" : "text-gray-400")}>
                                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-2 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Paperclip className="h-4 w-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />

                            <form onSubmit={handleSendMessage} className="flex-1">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </form>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() && !isUploading}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    newMessage.trim() || isUploading ? "bg-primary-600 text-white hover:bg-primary-700" : "text-gray-300"
                                )}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Messagerie</p>
                        <p className="text-xs text-gray-400 max-w-xs">
                            Sélectionnez une conversation ou démarrez-en une nouvelle.
                        </p>
                        {currentUserRole === 'resident' && (
                            <button
                                onClick={() => createConversation()}
                                className="mt-4 px-4 py-2 bg-primary-600 text-white text-xs font-medium rounded-full hover:bg-primary-700 transition-colors"
                            >
                                Contacter le syndic
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
