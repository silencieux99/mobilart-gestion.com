'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';

export default function ResidentReservationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-blue-50 p-6 rounded-3xl">
                <CalendarIcon className="h-16 w-16 text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Réservation d'Espaces</h1>
                <p className="text-gray-500 max-w-md mt-2 mx-auto">
                    Réservez bientôt la salle de sport, le court de tennis ou la salle de réunion directement depuis cette page.
                </p>
            </div>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                Bientôt disponible
            </button>
        </div>
    );
}
