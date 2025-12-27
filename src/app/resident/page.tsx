'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Home,
    Users,
    Megaphone,
    Send,
    Image as ImageIcon,
    Video,
    X,
    Clock,
    Loader2,
    MessageCircle
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
    senderAvatar?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: any;
}

export default function ResidentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [residentsCount, setResidentsCount] = useState(0);
    const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth and user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch user data
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch community messages
    useEffect(() => {
        const q = query(
            collection(db, 'community_messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
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
    }, []);

    // Fetch stats
    useEffect(() => {
        // Residents count
        const unsubResidents = onSnapshot(
            query(collection(db, 'users')),
            (snapshot) => {
                const residents = snapshot.docs.filter(d => d.data().role === 'resident');
                setResidentsCount(residents.length);
            }
        );

        // Latest announcement
        const unsubAnn = onSnapshot(
            query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(1)),
            (snapshot) => {
                if (!snapshot.empty) {
                    setLatestAnnouncement({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                }
            }
        );

        return () => {
            unsubResidents();
            unsubAnn();
        };
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user || sending) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'community_messages'), {
                content: newMessage.trim(),
                senderId: user.uid,
                senderName: userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : user.displayName || 'Résident',
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

        if (!isVideo && !isImage) {
            alert('Seules les images et vidéos sont autorisées');
            return;
        }

        // Limit file size (10MB for images, 50MB for videos)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`Fichier trop volumineux. Max: ${isVideo ? '50' : '10'}MB`);
            return;
        }

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
                content: isVideo ? '📹 Vidéo partagée' : '📷 Photo partagée',
                senderId: user.uid,
                senderName: userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : user.displayName || 'Résident',
                mediaUrl: blob.url,
                mediaType: isVideo ? 'video' : 'image',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erreur lors de l\'upload');
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

        if (isToday) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-120px)] sm:h-[calc(100vh-140px)]">
            {/* Info Bar */}
            <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Home className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase">Résidence</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">Mobilart</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase">Résidents</p>
                        <p className="text-sm font-semibold text-gray-900">{residentsCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase">Messages</p>
                        <p className="text-sm font-semibold text-gray-900">{messages.length}</p>
                    </div>
                </div>
            </div>

            {/* Latest Announcement */}
            {latestAnnouncement && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200 p-3 mb-4 shrink-0">
                    <div className="flex items-start gap-2">
                        <Megaphone className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-primary-800 truncate">{latestAnnouncement.title}</p>
                            <p className="text-[11px] text-primary-600 line-clamp-1 mt-0.5">{latestAnnouncement.content}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Community Chat */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden min-h-0">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                    <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Espace Communautaire
                    </h2>
                    <p className="text-[11px] text-gray-500">Discutez avec vos voisins</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageCircle className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Aucun message</p>
                            <p className="text-xs">Soyez le premier à écrire !</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                >
                                    <div className={cn(
                                        "max-w-[85%] sm:max-w-[70%]",
                                        isMe ? "order-2" : "order-1"
                                    )}>
                                        {!isMe && (
                                            <p className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                                        )}
                                        <div className={cn(
                                            "rounded-2xl px-3 py-2",
                                            isMe
                                                ? "bg-primary-600 text-white rounded-br-md"
                                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                                        )}>
                                            {msg.mediaUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    {msg.mediaType === 'video' ? (
                                                        <video
                                                            src={msg.mediaUrl}
                                                            controls
                                                            className="max-w-full max-h-60 rounded-lg"
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <img
                                                            src={msg.mediaUrl}
                                                            alt=""
                                                            className="max-w-full max-h-60 rounded-lg object-cover"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <p className={cn(
                                                "text-[9px] mt-1 text-right",
                                                isMe ? "text-white/70" : "text-gray-400"
                                            )}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
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
                            placeholder="Écrire un message..."
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                newMessage.trim()
                                    ? "bg-primary-600 text-white hover:bg-primary-700"
                                    : "text-gray-300"
                            )}
                        >
                            {sending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
