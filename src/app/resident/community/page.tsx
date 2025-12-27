'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Megaphone, Pin, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';

export default function ResidentCommunityPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const categories = ['all', 'Information', 'Maintenance', 'Urgent', 'Événement'];

    const filteredAnnouncements = filter === 'all'
        ? announcements
        : announcements.filter(a => a.category === filter);

    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Aujourd'hui";
        if (days === 1) return "Hier";
        if (days < 7) return `Il y a ${days} jours`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const getCategoryStyle = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'urgent': return 'bg-red-100 text-red-700';
            case 'maintenance': return 'bg-amber-100 text-amber-700';
            case 'événement': return 'bg-purple-100 text-purple-700';
            default: return 'bg-primary-100 text-primary-700';
        }
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-lg font-semibold text-gray-900">Actualités</h1>
                <p className="text-xs text-gray-500">{announcements.length} annonce(s) de la résidence</p>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                            filter === cat
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {cat === 'all' ? 'Tout' : cat}
                    </button>
                ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-3">
                {filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Megaphone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune annonce</p>
                    </div>
                ) : (
                    filteredAnnouncements.map((ann, index) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                                "bg-white rounded-xl p-4 border transition-all",
                                ann.category?.toLowerCase() === 'urgent'
                                    ? "border-red-200 bg-red-50/30"
                                    : "border-gray-100"
                            )}
                        >
                            {/* Top Row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                                        getCategoryStyle(ann.category)
                                    )}>
                                        {ann.category || 'Info'}
                                    </span>
                                    {ann.category?.toLowerCase() === 'urgent' && (
                                        <Pin className="h-3.5 w-3.5 text-red-500 rotate-45" />
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(ann.createdAt)}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                                {ann.title}
                            </h2>

                            {/* Content */}
                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                {ann.content}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <span className="text-[10px] text-gray-400">
                                    Administration
                                </span>
                                {ann.audience && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Tag className="h-2.5 w-2.5" />
                                        {ann.audience}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
