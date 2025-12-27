'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Image as ImageIcon,
    Loader2,
    MessageCircle,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    limit,
    doc,
    getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { cn } from '@/lib/utils';

interface CommunityMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: any;
}

interface CommunityChatboxProps {
    className?: string;
    compact?: boolean;
}

export default function CommunityChatbox({ className, compact = false }: CommunityChatboxProps) {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'community_messages'),
            orderBy('createdAt', 'desc'),
            limit(compact ? 30 : 50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CommunityMessage)).reverse();
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [compact]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const getSenderName = () => {
        if (userData?.firstName && userData?.lastName) {
            return `${userData.firstName} ${userData.lastName}`;
        }
        if (user?.displayName) return user.displayName;
        if (userData?.role === 'syndic' || userData?.role === 'super_admin') return 'Administration';
        return 'Utilisateur';
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user || sending) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'community_messages'), {
                content: newMessage.trim(),
                senderId: user.uid,
                senderName: getSenderName(),
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) return;

        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) return;

        setUploading(true);
        try {
            const filename = `community/${Date.now()}_${file.name}`;
            const response = await fetch(`/api/upload/chat?filename=${encodeURIComponent(filename)}`, {
                method: 'POST',
                body: file
            });

            if (!response.ok) throw new Error('Upload failed');
            const blob = await response.json();

            await addDoc(collection(db, 'community_messages'), {
                content: isVideo ? '📹 Vidéo' : '📷 Photo',
                senderId: user.uid,
                senderName: getSenderName(),
                mediaUrl: blob.url,
                mediaType: isVideo ? 'video' : 'image',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error uploading:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className={cn(
            "flex flex-col overflow-hidden",
            compact ? "bg-white rounded-2xl border border-gray-100 shadow-sm" : "bg-gradient-to-b from-gray-50 to-white",
            className
        )}>
            {/* Header */}
            <div className={cn(
                "shrink-0 flex items-center justify-between",
                compact ? "px-4 py-3 border-b border-gray-100" : "px-4 py-4"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center justify-center rounded-xl",
                        compact ? "h-8 w-8 bg-primary-100" : "h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30"
                    )}>
                        <MessageCircle className={cn("text-white", compact ? "h-4 w-4 text-primary-600" : "h-5 w-5")} />
                    </div>
                    <div>
                        <h2 className={cn("font-semibold text-gray-900", compact ? "text-sm" : "text-base")}>
                            Discussion
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500">{messages.length} messages</span>
                        </div>
                    </div>
                </div>
                {!compact && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 rounded-full">
                        <Sparkles className="h-3 w-3 text-primary-500" />
                        <span className="text-[10px] font-medium text-primary-600">Live</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className={cn(
                "flex-1 overflow-y-auto px-3 py-2 space-y-3",
                compact && "max-h-[280px]"
            )}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <MessageCircle className="h-7 w-7 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">Aucun message</p>
                        <p className="text-xs mt-1">Soyez le premier à discuter !</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
                                >
                                    {/* Avatar */}
                                    {!isMe && (
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-gray-600">
                                                {getInitials(msg.senderName)}
                                            </span>
                                        </div>
                                    )}

                                    <div className={cn("max-w-[75%]", isMe && "text-right")}>
                                        {!isMe && (
                                            <p className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">{msg.senderName}</p>
                                        )}
                                        <div className={cn(
                                            "inline-block rounded-2xl px-3.5 py-2",
                                            isMe
                                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md shadow-sm"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm"
                                        )}>
                                            {msg.mediaUrl && (
                                                <div className="mb-2 rounded-xl overflow-hidden">
                                                    {msg.mediaType === 'video' ? (
                                                        <video
                                                            src={msg.mediaUrl}
                                                            controls
                                                            className="max-w-full max-h-48 rounded-xl"
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <img
                                                            src={msg.mediaUrl}
                                                            alt=""
                                                            className="max-w-full max-h-48 rounded-xl object-cover"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-[13px] leading-relaxed">{msg.content}</p>
                                        </div>
                                        <p className={cn(
                                            "text-[9px] mt-1 px-1",
                                            isMe ? "text-gray-400" : "text-gray-400"
                                        )}>
                                            {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Sticky to bottom */}
            <div className="shrink-0 p-2 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-2 pr-1.5 py-1 shadow-sm focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <ImageIcon className="h-5 w-5" />
                        )}
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={scrollToBottom}
                        placeholder="Écrire un message..."
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                            "p-2.5 rounded-full transition-all",
                            newMessage.trim()
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                                : "bg-gray-100 text-gray-300"
                        )}
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
