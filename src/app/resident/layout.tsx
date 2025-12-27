'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResidentSidebar } from '@/components/resident/ResidentSidebar';
import { Header } from '@/components/dashboard/Header';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User as AppUser, UserRole } from '@/types';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function ResidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                router.push('/');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const docData = userDoc.data();
                    const userData = { id: userDoc.id, ...docData } as AppUser;

                    // Vérifier si l'utilisateur est admin (utiliser la valeur string directement)
                    if (docData.role === 'admin') {
                        // Rediriger les admins vers le dashboard admin
                        router.push('/dashboard');
                        return;
                    }

                    // Vérifier si le compte est actif
                    if (!userData.isActive || docData.status === 'pending') {
                        router.push('/');
                        return;
                    }

                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary-500/10 flex items-center justify-center animate-pulse">
                        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">Chargement de votre espace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sand-50/50 flex font-sans">
            <ResidentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-2xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            {/* Local toaster if needed, but root layout has one. */}
        </div>
    );
}
