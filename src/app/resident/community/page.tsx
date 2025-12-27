'use client';

import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Megaphone,
    Calendar,
    Pin,
    MessageSquare,
    Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ResidentCommunityPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                    Vie de la Résidence
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Actualités, événements et informations importantes.
                </p>
            </div>

            <div className="space-y-6">
                {announcements.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune annonce pour le moment.</p>
                    </div>
                ) : (
                    announcements.map((ann, index) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        >
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-white rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-0.5">
                                            {ann.category || 'Information'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}
                                        </span>
                                    </div>
                                </div>
                                {/* Pin icon if high priority (mock) */}
                                {ann.priority === 'urgent' && <Pin className="h-5 w-5 text-red-400 rotate-45" />}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">
                                {ann.title}
                            </h2>

                            <div className="prose prose-gray max-w-none text-gray-600 mb-6 leading-relaxed">
                                {ann.content}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <div className="flex -space-x-2">
                                    {/* Mock likes/reactions avatars */}
                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200" />
                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-300" />
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-gray-50 text-xs font-medium text-gray-500 pl-1">
                                        +5
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                        <Heart className="h-5 w-5" />
                                        <span className="hidden sm:inline">J'aime</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
