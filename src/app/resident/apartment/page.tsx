'use client';

import React, { useEffect, useState } from 'react';
import { Home, User, Building2, Car, Package, Mail, Phone, Calendar, Shield, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function ResidentApartmentPage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
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
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        );
    }

    const formatApartmentDetails = (details: any) => {
        if (!details) return "Non assigné";
        if (typeof details === 'string') return details;
        if (typeof details === 'object') {
            const { tower, floor, number, apartmentNumber } = details;
            return `Tour ${tower || '?'} • Étage ${floor || '?'} • Appt ${number || apartmentNumber || '?'}`;
        }
        return "Non défini";
    };

    const rawOccupancyType = userData?.occupancyType ||
        (typeof userData?.tempApartmentDetails === 'object' ? userData?.tempApartmentDetails?.occupancyType : null);
    const occupancyType = rawOccupancyType === 'owner' ? 'Propriétaire' :
        rawOccupancyType === 'tenant' ? 'Locataire' : 'Résident';
    const isOwner = rawOccupancyType === 'owner';

    const formatDate = (timestamp: any) => {
        if (!timestamp) return null;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div>
                <h1 className="text-lg font-semibold text-gray-900">Mon Appartement</h1>
                <p className="text-xs text-gray-500">Vos informations de logement</p>
            </div>

            {/* Main Card - Apartment */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Home className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-white/70">Adresse</p>
                            <p className="font-semibold">{formatApartmentDetails(userData?.tempApartmentDetails)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            isOwner ? "bg-indigo-500/30 text-white" : "bg-orange-500/30 text-white"
                        )}>
                            {occupancyType}
                        </span>
                        <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            userData?.validatedAt ? "bg-emerald-500/30 text-white" : "bg-amber-500/30 text-white"
                        )}>
                            {userData?.validatedAt ? '✓ Validé' : '⏳ En attente'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Informations personnelles</p>
                </div>

                <div className="divide-y divide-gray-100">
                    <InfoRow
                        icon={User}
                        label="Nom complet"
                        value={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
                    />
                    <InfoRow
                        icon={Mail}
                        label="Email"
                        value={userData?.email}
                    />
                    <InfoRow
                        icon={Phone}
                        label="Téléphone"
                        value={userData?.phone || 'Non renseigné'}
                    />
                    {userData?.registeredAt && (
                        <InfoRow
                            icon={Calendar}
                            label="Inscrit le"
                            value={formatDate(userData.registeredAt)}
                        />
                    )}
                </div>
            </div>

            {/* Dependencies - Parking & Cellar */}
            {typeof userData?.tempApartmentDetails === 'object' &&
                (userData.tempApartmentDetails.parking || userData.tempApartmentDetails.cellar) && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dépendances</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {userData.tempApartmentDetails.parking && (
                                <InfoRow
                                    icon={Car}
                                    label="Parking"
                                    value={userData.tempApartmentDetails.parking}
                                />
                            )}
                            {userData.tempApartmentDetails.cellar && (
                                <InfoRow
                                    icon={Package}
                                    label="Cave / Box"
                                    value={userData.tempApartmentDetails.cellar}
                                />
                            )}
                        </div>
                    </div>
                )}

            {/* Residence Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Résidence</p>
                </div>

                <div className="divide-y divide-gray-100">
                    <InfoRow
                        icon={Building2}
                        label="Nom"
                        value="Résidence Mobilart"
                    />
                    <InfoRow
                        icon={Shield}
                        label="Syndic"
                        value="Mobilart Gestion"
                    />
                </div>
            </div>

            {/* Help */}
            <p className="text-[11px] text-center text-gray-400 pt-2">
                Besoin de modifier ces informations ?{' '}
                <a href="/resident/messages" className="text-primary-600 font-medium">
                    Contactez-nous
                </a>
            </p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) {
    return (
        <div className="px-4 py-3 flex items-start gap-3">
            <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-gray-900 break-words">{value || '-'}</p>
            </div>
        </div>
    );
}
