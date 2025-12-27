'use client';

import React from 'react';
import { Bell, Shield, User, LogOut } from 'lucide-react';

export default function ResidentSettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-sm">
                <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        Profil
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Mettez à jour vos informations personnelles.</p>
                    <button className="text-primary-600 font-medium text-sm hover:underline">Modifier le profil</button>
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-gray-400" />
                        Notifications
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Gérez vos préférences de contact.</p>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-700">Email (Nouvelles factures)</span>
                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-700">SMS (Urgences)</span>
                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                        </label>
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-400" />
                        Sécurité
                    </h3>
                    <button className="text-primary-600 font-medium text-sm hover:underline mt-2">Changer le mot de passe</button>
                </div>
            </div>

            <button className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" />
                Se déconnecter
            </button>
        </div>
    );
}
