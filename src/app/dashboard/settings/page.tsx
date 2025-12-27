import React from 'react';
import { Construction } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Construction className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h2>
            <p className="text-gray-500 max-w-md">
                Configurez les préférences de l'application, les rôles utilisateurs et les options générales.
            </p>
        </div>
    );
}
