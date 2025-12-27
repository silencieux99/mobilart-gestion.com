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
        <div className="space-y-6">
            {/* Simple Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Mon Appartement</h1>
                <p className="text-sm text-gray-500">Informations de votre logement</p>
            </div>

            {/* Main Info Card - Simple & Clean */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {/* Apartment Number Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <Home className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Logement</p>
                            <p className="font-semibold text-gray-900">{formatApartmentDetails(userData?.tempApartmentDetails)}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${userData?.validatedAt
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                        {userData?.validatedAt ? 'Validé' : 'En attente'}
                    </span>
                </div>

                {/* Info Rows */}
                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Résident</span>
                    <span className="text-sm font-medium text-gray-900">{userData?.firstName} {userData?.lastName}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Statut</span>
                    <span className={`text-sm font-medium ${isOwner ? 'text-indigo-600' : 'text-orange-600'}`}>
                        {occupancyType}
                    </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm text-gray-900 truncate max-w-[200px]">{userData?.email}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Téléphone</span>
                    <span className="text-sm text-gray-900">{userData?.phone || 'Non renseigné'}</span>
                </div>
            </div>

            {/* Parking & Cellar - Only if exists */}
            {(typeof userData?.tempApartmentDetails === 'object' && (userData.tempApartmentDetails.parking || userData.tempApartmentDetails.cellar)) && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Dépendances</p>
                    </div>

                    {userData.tempApartmentDetails.parking && (
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Parking</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{userData.tempApartmentDetails.parking}</span>
                        </div>
                    )}

                    {userData.tempApartmentDetails.cellar && (
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Cave / Box</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{userData.tempApartmentDetails.cellar}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Help Link */}
            <p className="text-xs text-center text-gray-400">
                Besoin de modifier ces informations ?{' '}
                <a href="/resident/messages" className="text-primary-600 hover:underline">
                    Contactez-nous
                </a>
            </p>
        </div>
    );
}
