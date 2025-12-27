'use client';

import React, { useEffect, useState } from 'react';
import { Home, User, Key, Shield, Building2 } from 'lucide-react';
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

    // Default or Fallback data
    const apartmentDetails = userData?.tempApartmentDetails || "Non assigné";
    const occupancyType = userData?.occupancyType === 'owner' ? 'Propriétaire' : 'Locataire';
    const isOwner = userData?.occupancyType === 'owner';

    // Parse temp details if possible "Tour X - Floor Y - Appt Z"
    // This is a simple display logic, robust parsing would be better but this suffices for now

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Appartement</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                        <Home className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{apartmentDetails}</h2>
                        <p className="text-gray-500">
                            {userData?.validatedAt ? 'Appartement Validé' : 'En attente de validation'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Occupant principal</span>
                            <span className="font-semibold text-gray-900">
                                {userData?.firstName} {userData?.lastName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Type d'occupation</span>
                            <span className={`font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide ${isOwner ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                {occupancyType}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Email de contact</span>
                            <span className="font-semibold text-gray-900 text-sm">{userData?.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Téléphone</span>
                            <span className="font-semibold text-gray-900">{userData?.phone || "Non renseigné"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-blue-900">Information</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Si les informations de votre appartement sont incorrectes, veuillez contacter l'administration ou attendre la validation finale de votre dossier.
                    </p>
                </div>
            </div>
        </div>
    );
}
