'use client';

import React, { useState, useEffect } from 'react';
import { Home, Users, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import CommunityChatbox from '@/components/community/CommunityChatbox';
import Link from 'next/link';

export default function ResidentDashboard() {
    const [residentsCount, setResidentsCount] = useState(0);
    const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const unsubResidents = onSnapshot(
            query(collection(db, 'users')),
            (snapshot) => {
                const residents = snapshot.docs.filter(d => d.data().role === 'resident');
                setResidentsCount(residents.length);
            }
        );

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

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 mb-4 text-white relative overflow-hidden"
            >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Home className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Bienvenue</h1>
                            <p className="text-xs text-white/80">Résidence Mobilart</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{residentsCount} résidents</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-medium">En ligne</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Announcement Card */}
            {latestAnnouncement && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Link href="/resident/community" className="block">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-3 hover:shadow-md hover:border-primary-200 transition-all group">
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                <Bell className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">Annonce</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{latestAnnouncement.title}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                    </Link>
                </motion.div>
            )}

            {/* Community Chat */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 min-h-0"
            >
                <CommunityChatbox className="h-full rounded-2xl border border-gray-100 shadow-sm" />
            </motion.div>
        </div>
    );
}
