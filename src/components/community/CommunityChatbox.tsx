'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc } from 'firebase/firestore';
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
            limit(compact ? 25 : 40)
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
        }, 50);
    };

    const getSenderName = () => {
        if (userData?.firstName && userData?.lastName) {
            return `${userData.firstName} ${userData.lastName}`;
        }
        if (user?.displayName) return user.displayName;
        if (userData?.role === 'syndic' || userData?.role === 'super_admin') return 'Admin';
        return 'Résident';
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
            console.error('Error:', error);
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
                content: isVideo ? '📹' : '📷',
                senderId: user.uid,
                senderName: getSenderName(),
                mediaUrl: blob.url,
                mediaType: isVideo ? 'video' : 'image',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={cn(
            "flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden",
            className
        )}>
            {/* Header - Minimal */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-700">Discussion</span>
                </div>
                <span className="text-[10px] text-gray-400">{messages.length} msg</span>
            </div>

            {/* Messages */}
            <div className={cn(
                "flex-1 overflow-y-auto px-3 py-2 space-y-2",
                compact && "max-h-[200px]"
            )}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                        <MessageCircle className="h-6 w-6 mb-1 opacity-40" />
                        <p className="text-[11px]">Pas encore de message</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                >
                                    <div className={cn("max-w-[75%]", isMe && "text-right")}>
                                        {!isMe && (
                                            <p className="text-[9px] text-gray-400 mb-0.5 ml-2">{msg.senderName}</p>
                                        )}
                                        <div className={cn(
                                            "inline-block rounded-2xl px-3 py-1.5 text-[13px] leading-tight",
                                            isMe
                                                ? "bg-primary-600 text-white rounded-br-sm"
                                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                        )}>
                                            {msg.mediaUrl && (
                                                <div className="mb-1 rounded-lg overflow-hidden">
                                                    {msg.mediaType === 'video' ? (
                                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-32 rounded-lg" playsInline />
                                                    ) : (
                                                        <img src={msg.mediaUrl} alt="" className="max-w-full max-h-32 rounded-lg object-cover" loading="lazy" />
                                                    )}
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>
                                        <p className={cn("text-[8px] mt-0.5 px-2", isMe ? "text-gray-400" : "text-gray-400")}>
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

            {/* Input - Compact */}
            <div className="shrink-0 p-2 border-t border-gray-100 bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-white transition-colors"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={scrollToBottom}
                        placeholder="Message..."
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                            "p-2 rounded-full transition-all",
                            newMessage.trim() ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"
                        )}
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
