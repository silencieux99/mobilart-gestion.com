'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Bell,
    Search,
    Menu,
    ChevronDown,
    LogOut,
    Settings,
    User
} from 'lucide-react';
import { User as AppUser } from '@/types';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

interface HeaderProps {
    user: AppUser | null;
    onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Déconnexion réussie');
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };
    return (
        <header className="h-16 sm:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all duration-300">
            <div className="flex items-center flex-1 gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-700 lg:hidden rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex relative group flex-1 max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all duration-200 sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-4">
                {/* Mobile Search Icon */}
                <button className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Search className="h-6 w-6" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 pl-1 sm:pl-2 cursor-pointer group hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-primary-100 to-secondary-100 border-2 border-white shadow-sm flex items-center justify-center text-primary-700 font-bold text-base sm:text-lg">
                            {user?.firstName?.[0] || 'U'}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Utilisateur'}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-all hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            
                            <button
                                onClick={() => {
                                    router.push('/dashboard/settings');
                                    setDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                Paramètres
                            </button>
                            
                            <button
                                onClick={() => {
                                    router.push(`/dashboard/residents/${user?.id}`);
                                    setDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                Mon profil
                            </button>
                            
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
