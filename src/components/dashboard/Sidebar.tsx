'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wrench,
    Wallet,
    MessageSquare,
    CalendarDays,
    FileText,
    Settings,
    X,
    Building2,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Résidents', href: '/dashboard/residents', icon: Users },
    { name: 'Maintenance', href: '/dashboard/incidents', icon: Wrench },
    { name: 'Finances & Charges', href: '/dashboard/finance', icon: Wallet },
    { name: 'Messagerie', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Réservations', href: '/dashboard/reservations', icon: CalendarDays },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

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
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-gray-900 tracking-tight">
                                Mobilart
                            </h1>
                            <p className="text-xs font-medium text-primary-500 tracking-wide uppercase">Gestion</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto lg:hidden p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Menu Principal
                    </p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

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
                                        layoutId="activeTab"
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
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group">
                        <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                        Se déconnecter
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
