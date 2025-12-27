'use client';

import React, { useEffect, useState } from 'react';
import { Home, User, Key, Shield, Building2, Car, Package, Mail, Phone } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ResidentApartmentPage() {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Helper to safely format apartment details
    const formatApartmentDetails = (details: any) => {
        if (!details) return "Non assigné";
        if (typeof details === 'string') return details;
        if (typeof details === 'object') {
            const { tower, floor, number, apartmentNumber } = details;
            const num = number || apartmentNumber || '?';
            return `Tour ${tower || '?'} - Étage ${floor || '?'} - Appt ${num}`;
        }
        return "Format inconnu";
    };

    const apartmentDetails = formatApartmentDetails(userData?.tempApartmentDetails);

    // Handle occupancy type from root or nested object
    const rawOccupancyType = userData?.occupancyType || (typeof userData?.tempApartmentDetails === 'object' ? userData?.tempApartmentDetails?.occupancyType : null);
    const occupancyType = rawOccupancyType === 'owner' ? 'Propriétaire' :
        rawOccupancyType === 'tenant' ? 'Locataire' : 'Résident';

    const isOwner = rawOccupancyType === 'owner';

    // Parse temp details if possible "Tour X - Floor Y - Appt Z"
    // This is a simple display logic, robust parsing would be better but this suffices for now

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="px-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mon Appartement</h1>
                <p className="text-gray-500 mt-1">Vos informations de résidence</p>
            </div>

            {/* Premium Resident Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl p-8 transition-transform hover:scale-[1.01] duration-300">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <Home className="h-6 w-6 text-white" />
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 ${userData?.validatedAt ? 'bg-emerald-500/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100'
                            }`}>
                            {userData?.validatedAt ? 'VOUS ÊTES VALIDÉ' : 'EN ATTENTE'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Résidence Mobilart</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                            {formatApartmentDetails(userData?.tempApartmentDetails)}
                        </h2>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                        <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold">Résident Principal</p>
                            <p className="font-medium text-lg">{userData?.firstName} {userData?.lastName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold">Statut</p>
                            <p className="font-medium text-lg">{occupancyType}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <User className="h-5 w-5 text-gray-500" />
                        </div>
                        Informations Personnelles
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 group">
                            <div className="mt-1">
                                <Mail className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div className="flex-1 border-b border-gray-50 pb-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                <p className="font-medium text-gray-900 break-all text-base">{userData?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="mt-1">
                                <Phone className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div className="flex-1 border-b border-gray-50 pb-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Téléphone</p>
                                <p className="font-medium text-gray-900 text-base">{userData?.phone || "Non renseigné"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {(typeof userData?.tempApartmentDetails === 'object' && (userData.tempApartmentDetails.parking || userData.tempApartmentDetails.cellar)) && (
                    <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Key className="h-5 w-5 text-gray-500" />
                            </div>
                            Dépendances
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {userData.tempApartmentDetails.parking && (
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Car className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600 font-medium">Parking</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{userData.tempApartmentDetails.parking}</span>
                                </div>
                            )}
                            {userData.tempApartmentDetails.cellar && (
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600 font-medium">Box / Cave</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{userData.tempApartmentDetails.cellar}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center pt-4">
                <p className="text-sm text-gray-400">
                    Ces informations sont incorrectes ? <br />
                    <a href="/resident/messages" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors inline-flex items-center gap-1 mt-2">
                        Contacter la gestion
                        <span aria-hidden="true">&rarr;</span>
                    </a>
                </p>
            </div>
        </div>
    );
}
