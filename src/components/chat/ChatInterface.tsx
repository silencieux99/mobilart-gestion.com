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
    Paperclip
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
            q = query(collection(db, 'conversations'), orderBy('lastMessageTime', 'desc'));
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !isUploading)) return;

        try {
            let convId = activeConversationId;

            // If resident and no active conversion, create one
            if (!convId && currentUserRole === 'resident') {
                // Check if one exists first (race condition with useEffect)
                // If not, create new
                const newConvRef = doc(collection(db, 'conversations'));
                // Assuming 'admin' is a generic ID or we pick a specific one. For now, let's say 'admin' or just marking participants is enough.
                // We'll mark the other participant as 'system_admin' or just a flag. 
                // Simplified: conversation ID can be just the user ID if 1-to-1 with support? 
                // Let's stick to auto-id.

                // We need to know who the "Admin" is. 
                // For simplicity, we'll just put currentUserId in participants and a 'support' flag
                // Real implementation: participants: [currentUserId, 'admin_group']

                await setDoc(newConvRef, {
                    participants: [currentUserId, 'admin'], // 'admin' is a placeholder ID for the support team
                    lastMessage: newMessage,
                    lastMessageTime: serverTimestamp(),
                    unreadCount: 1
                });
                convId = newConvRef.id;
                setActiveConversationId(convId);
            }

            if (convId) {
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
                    unreadCount: 1 // Increment logic needed properly
                });

                setNewMessage('');
            }
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
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Sidebar / Conversation List */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/30",
                mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        <button className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => {
                                setActiveConversationId(conv.id);
                                setMobileShowChat(true);
                            }}
                            className={cn(
                                "p-4 cursor-pointer transition-colors hover:bg-gray-100 flex gap-4 border-b border-gray-50",
                                activeConversationId === conv.id ? "bg-white border-l-4 border-l-primary-500 shadow-sm" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                {currentUserRole === 'admin' && conv.participantDetails ?
                                    (conv.participantDetails.firstName?.[0] || 'U') :
                                    'S'
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        {currentUserRole === 'admin' ?
                                            (conv.participantDetails ? `${conv.participantDetails.firstName} ${conv.participantDetails.lastName}` : 'Utilisateur inconnu') :
                                            'Service Syndic'
                                        }
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {conv.lastMessageTime?.toDate ? conv.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate flex items-center">
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Aucune conversation.
                            {currentUserRole === 'resident' && <p className="mt-2 text-primary-600 cursor-pointer" onClick={handleSendMessage}>Démarrer une discussion</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#F0F2F5] relative",
                !mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {/* WhatsApp-style decorative background pattern could go here via CSS */}

                {activeConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 -ml-2 text-gray-600"
                                    onClick={() => setMobileShowChat(false)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {currentUserRole === 'admin' ? 'U' : 'S'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {currentUserRole === 'admin' ? 'Détails Résident' : 'Service Syndic'}
                                    </h3>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        En ligne
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                {/* <Search className="h-5 w-5 cursor-pointer hover:text-gray-600" /> */}
                                <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-600" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[80%] sm:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm relative group",
                                            isMe ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none"
                                        )}>
                                            {msg.imageUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                                                    <img src={msg.imageUrl} alt="Shared" className="max-w-full h-auto" />
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-gray-500">
                                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </span>
                                                {isMe && (
                                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 flex items-end gap-2">
                            <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                                <Smile className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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

                            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all border border-transparent focus-within:border-primary-200">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 max-h-32"
                                />
                            </form>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() && !isUploading}
                                className={cn(
                                    "p-3 rounded-full transition-all shadow-md",
                                    newMessage.trim() || isUploading ? "bg-primary-600 text-white hover:bg-primary-500 hover:scale-105 active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Mobilart Messagerie</h3>
                        <p className="max-w-md">
                            Sélectionnez une conversation pour commencer à discuter.
                            Messages privés et sécurisés.
                        </p>
                        {currentUserRole === 'resident' && (
                            <button
                                onClick={() => handleSendMessage()}
                                className="mt-8 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
                            >
                                Contacter le Syndic
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
