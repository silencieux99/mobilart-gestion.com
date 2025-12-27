'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    AlertCircle,
    MessageSquare,
    CalendarDays,
    Settings,
    X,
    Building2,
    LogOut,
    Home,
    Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { name: 'Vue d\'ensemble', href: '/resident', icon: LayoutDashboard },
    { name: 'Mes Paiements', href: '/resident/finance', icon: Wallet },
    { name: 'Signalements', href: '/resident/incidents', icon: AlertCircle },
    { name: 'Messagerie', href: '/resident/messages', icon: MessageSquare },
    { name: 'Communauté', href: '/resident/community', icon: Megaphone },
    { name: 'Réservations', href: '/resident/reservation', icon: CalendarDays },
    { name: 'Mon Appartement', href: '/resident/apartment', icon: Home },
    { name: 'Paramètres', href: '/resident/settings', icon: Settings },
];

export function ResidentSidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid || null);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                // Show badge if unreadCount > 0 and last message was NOT sent by me
                if (data.unreadCount > 0 && data.lastSenderId !== userId) {
                    count += data.unreadCount;
                }
            });
            setUnreadCount(count);
        });
        return () => unsubscribe();
    }, [userId]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Déconnexion réussie');
            router.push('/');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl lg:shadow-none lg:static lg:transform-none transform transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-8 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-700">
                    <div className="flex items-center space-x-3 text-white">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold tracking-tight">
                                Mobilart
                            </h1>
                            <p className="text-xs font-medium text-primary-100 tracking-wide uppercase">Espace Résident</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto lg:hidden p-2 text-white/70 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Menu
                    </p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        const isMessages = item.name === 'Messagerie';

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={cn(
                                    "group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                                    isActive
                                        ? "text-primary-600 bg-primary-50 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabResident"
                                        className="absolute inset-0 bg-primary-50 border-l-4 border-primary-500 rounded-r-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn(
                                    "mr-3 h-5 w-5 transition-colors relative z-10",
                                    isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                <span className="relative z-10">{item.name}</span>
                                {isMessages && unreadCount > 0 && (
                                    <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full relative z-10 animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                        Se déconnecter
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
