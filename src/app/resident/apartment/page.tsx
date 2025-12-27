'use client';

import React from 'react';
import { Home, User, Key, Shield } from 'lucide-react';

export default function ResidentApartmentPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Appartement</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                        <Home className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Appartement A-12-04</h2>
                        <p className="text-gray-500">Tour A • 12ème Étage</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Surface</span>
                            <span className="font-semibold text-gray-900">125 m²</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Type</span>
                            <span className="font-semibold text-gray-900">F4</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Parking</span>
                            <span className="font-semibold text-gray-900">Place 45 (S-1)</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm">Statut</span>
                            <span className="font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">Occupé</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8">Occupants enregistrés</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        AB
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">Ahmed Benali</p>
                        <p className="text-xs text-gray-500">Propriétaire</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
