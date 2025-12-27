'use client';

import React, { useState, useEffect } from 'react';
import { Users, Bell, ChevronRight, Calendar, AlertTriangle, MessageCircle, FileText, Home } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import CommunityChatbox from '@/components/community/CommunityChatbox';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ResidentDashboard() {
    const [userName, setUserName] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [residentsCount, setResidentsCount] = useState(0);
    const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);
    const [myIncidentsCount, setMyIncidentsCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
    }, []);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserName(data.firstName || '');
                    setUserData(data);
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

    // Fetch user's incidents count
    useEffect(() => {
        if (!userId) return;
        const unsubIncidents = onSnapshot(
            query(collection(db, 'incidents'), where('reporterId', '==', userId), where('status', 'in', ['nouveau', 'en_cours'])),
            (snapshot) => setMyIncidentsCount(snapshot.size)
        );
        return () => unsubIncidents();
    }, [userId]);

    const getApartmentInfo = () => {
        if (!userData?.tempApartmentDetails) return null;
        if (typeof userData.tempApartmentDetails === 'string') {
            return userData.tempApartmentDetails;
        }
        return `Tour ${userData.tempApartmentDetails.tower || '?'} - Appt ${userData.tempApartmentDetails.number || '?'}`;
    };

    return (
        <div className="space-y-4 pb-4">
            {/* Welcome Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                    <h1 className="text-lg font-bold">
                        {userName ? `Bonjour ${userName} 👋` : 'Bienvenue'}
                    </h1>
                    <p className="text-xs text-white/80 mt-0.5">Résidence Mobilart</p>
                    {getApartmentInfo() && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs bg-white/15 rounded-full px-2.5 py-1 w-fit">
                            <Home className="h-3 w-3" />
                            {getApartmentInfo()}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <Users className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{residentsCount}</p>
                    <p className="text-[10px] text-gray-500">Résidents</p>
                </div>
                <Link href="/resident/incidents" className="bg-white rounded-xl p-3 border border-gray-100 text-center hover:border-amber-200 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{myIncidentsCount}</p>
                    <p className="text-[10px] text-gray-500">Signalements</p>
                </Link>
                <Link href="/resident/community" className="bg-white rounded-xl p-3 border border-gray-100 text-center hover:border-primary-200 transition-colors">
                    <Bell className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">→</p>
                    <p className="text-[10px] text-gray-500">Actualités</p>
                </Link>
            </div>

            {/* Announcement Banner */}
            {latestAnnouncement && (
                <Link href="/resident/community" className="block">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Bell className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-orange-600 font-semibold uppercase">Dernière annonce</p>
                            <p className="text-xs text-orange-900 font-medium truncate">{latestAnnouncement.title}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-orange-300 shrink-0" />
                    </div>
                </Link>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
                <Link href="/resident/incidents" className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 hover:border-primary-200 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Signaler</p>
                        <p className="text-[10px] text-gray-500">Un problème</p>
                    </div>
                </Link>
                <Link href="/resident/messages" className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 hover:border-primary-200 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Messages</p>
                        <p className="text-[10px] text-gray-500">Contacter admin</p>
                    </div>
                </Link>
            </div>

            {/* Community Chat - Limited height */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-900">Discussion communautaire</h2>
                    <span className="text-[10px] text-gray-400">Tous les résidents</span>
                </div>
                <div className="h-[280px]">
                    <CommunityChatbox className="h-full" compact />
                </div>
            </div>
        </div>
    );
}
