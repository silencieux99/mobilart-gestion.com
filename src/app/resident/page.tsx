'use client';

import React, { useState, useEffect } from 'react';
import { Users, Bell, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import CommunityChatbox from '@/components/community/CommunityChatbox';
import Link from 'next/link';

export default function ResidentDashboard() {
    const [userName, setUserName] = useState('');
    const [residentsCount, setResidentsCount] = useState(0);
    const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().firstName || '');
                }
            }
        });

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
            unsubAuth();
            unsubResidents();
            unsubAnn();
        };
    }, []);

    return (
        <div className="h-full flex flex-col gap-3 overflow-hidden">
            {/* Welcome - Simple & Clean */}
            <div className="shrink-0">
                <h1 className="text-lg font-semibold text-gray-900">
                    {userName ? `Bonjour ${userName} 👋` : 'Bienvenue'}
                </h1>
                <p className="text-xs text-gray-500">Résidence Mobilart • {residentsCount} résidents</p>
            </div>

            {/* Announcement - Compact */}
            {latestAnnouncement && (
                <Link href="/resident/community" className="block shrink-0">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
                        <Bell className="h-4 w-4 text-orange-500 shrink-0" />
                        <p className="text-xs text-orange-800 font-medium truncate flex-1">{latestAnnouncement.title}</p>
                        <ChevronRight className="h-4 w-4 text-orange-300 shrink-0" />
                    </div>
                </Link>
            )}

            {/* Chat - Takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <CommunityChatbox className="h-full" />
            </div>
        </div>
    );
}
