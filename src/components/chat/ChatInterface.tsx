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

            // Mark as read logic would go here (updateDoc 'read' = true)
        });

        return () => unsubscribe();
    }, [activeConversationId]);

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
                lastMessageTime: serverTimestamp(),
                unreadCount: 1 // TODO: Proper increment logic
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
        <div className="flex flex-col md:flex-row h-[80vh] sm:h-[calc(100vh-120px)] w-full bg-white sm:rounded-2xl sm:border border-gray-200 sm:shadow-lg overflow-hidden">
            {/* Sidebar / Conversation List */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white",
                mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {/* Sidebar Header */}
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                        <div className="flex items-center justify-center h-full w-full bg-gray-300 text-gray-500 font-bold">
                            {currentUserRole === 'admin' ? 'A' : 'R'}
                        </div>
                    </div>
                    <div className="flex gap-4 text-gray-500">
                        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors"><MoreVertical className="h-5 w-5" /></button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-2 border-b border-gray-200 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une discussion"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-[#00a884] transition-all placeholder:text-gray-500"
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
                                "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50",
                                activeConversationId === conv.id ? "bg-gray-100" : "bg-white"
                            )}
                        >
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0 text-xl overflow-hidden">
                                {currentUserRole === 'admin' && conv.participantDetails ?
                                    (conv.participantDetails.firstName?.[0] || 'U') :
                                    <Shield className="h-6 w-6 text-gray-500" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900 truncate text-base">
                                        {currentUserRole === 'admin' ?
                                            (conv.participantDetails ? `${conv.participantDetails.firstName} ${conv.participantDetails.lastName}` : 'Utilisateur inconnu') :
                                            'Administration'
                                        }
                                    </h3>
                                    <span className="text-[11px] text-gray-400">
                                        {conv.lastMessageTime?.toDate ? conv.lastMessageTime.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                    {conv.unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-[#00a884] inline-block" />}
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}

                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-400 text-sm">Aucune discussion</p>
                            {currentUserRole === 'resident' && (
                                <button
                                    onClick={createConversation}
                                    className="mt-4 text-[#00a884] text-sm font-medium hover:underline"
                                >
                                    Démarrer une conversation
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col relative bg-[#EFEAE2]",
                !mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #d1d7db 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {activeConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-2 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                                    onClick={() => setMobileShowChat(false)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                    {currentUserRole === 'admin' ? 'U' : <Shield className="h-5 w-5" />}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                        {currentUserRole === 'admin' ? 'Détails Résident' : 'Service Syndic'}
                                    </h3>
                                    <span className="text-xs text-gray-500">En ligne</span>
                                </div>
                            </div>
                            <div className="flex gap-4 px-2">
                                <Search className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                                <MoreVertical className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar z-0">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[85%] sm:max-w-[65%] px-3 py-2 shadow-sm text-sm relative",
                                            isMe ? "bg-[#d9fdd3] text-gray-900 rounded-lg rounded-tr-none" : "bg-white text-gray-900 rounded-lg rounded-tl-none"
                                        )}>
                                            {msg.imageUrl && (
                                                <div className="mb-2 rounded overflow-hidden">
                                                    <img src={msg.imageUrl} alt="Shared" className="max-w-full h-auto object-cover" />
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap leading-snug">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1 select-none">
                                                <span className="text-[10px] text-gray-500/80">
                                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </span>
                                                {isMe && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-2 sm:p-3 bg-gray-50 flex items-end gap-2 shrink-0 z-10 border-t border-gray-200">
                            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors hidden sm:block">
                                <Smile className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <Paperclip className="h-6 w-6" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />

                            <form onSubmit={handleSendMessage} className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 shadow-sm border border-gray-100">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez un message"
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm max-h-24"
                                />
                            </form>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() && !isUploading}
                                className={cn(
                                    "p-3 rounded-full shadow-sm transition-all flex items-center justify-center",
                                    newMessage.trim() || isUploading ? "bg-[#00a884] text-white hover:bg-[#008f6f] active:scale-95" : "bg-transparent text-gray-400"
                                )}
                            >
                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 z-10">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Shield className="h-8 w-8 text-[#00a884]" />
                            </div>
                        </div>
                        <h3 className="text-xl font-light text-gray-800 mb-2">Mobilart Web</h3>
                        <p className="max-w-md text-sm text-gray-400 leading-relaxed">
                            Envoyez et recevez des messages au syndic.<br />
                            Gardez votre téléphone connecté pour synchroniser les messages.
                        </p>
                        <div className="mt-8 border-t border-gray-300 w-16 mb-4"></div>
                        {currentUserRole === 'resident' && (
                            <button
                                onClick={() => createConversation()}
                                className="px-6 py-2 bg-[#00a884] text-white rounded-full font-medium shadow-md hover:bg-[#008f6f] transition-all"
                            >
                                Démarrer une conversation
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
