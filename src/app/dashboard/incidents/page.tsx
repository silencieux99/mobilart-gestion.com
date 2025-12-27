'use client';

import React, { useState, useEffect } from 'react';
import {
    MoreHorizontal,
    Clock,
    MapPin,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const COLUMNS = [
    { id: 'nouveau', title: 'À Traiter', color: 'bg-red-500', statuses: ['nouveau'] },
    { id: 'en_cours', title: 'En Cours', color: 'bg-blue-500', statuses: ['en_cours', 'en_attente'] },
    { id: 'resolu', title: 'Résolu', color: 'bg-emerald-500', statuses: ['resolu', 'ferme', 'annule'] },
];

export default function IncidentsPage() {
    const [activeTab, setActiveTab] = useState('board');
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedIncidents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setIncidents(fetchedIncidents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching incidents:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
                    <p className="text-sm text-gray-500">Suivi des signalements</p>
                </div>
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", activeTab === 'board' ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
                    >
                        Board
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", activeTab === 'list' ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
                    >
                        Liste
                    </button>
                </div>
            </div>

            {/* Board View */}
            {activeTab === 'board' && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[900px]">
                        {COLUMNS.map((col) => {
                            const colIncidents = incidents.filter(i => col.statuses.includes(i.status));
                            return (
                                <div key={col.id} className="flex-1 min-w-[280px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                                        <h3 className="font-semibold text-gray-700 text-sm">{col.title}</h3>
                                        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded">
                                            {colIncidents.length}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-3 min-h-[300px]">
                                        {colIncidents.map((incident) => (
                                            <IncidentCard key={incident.id} incident={incident} />
                                        ))}
                                        {colIncidents.length === 0 && (
                                            <div className="text-center py-8 text-gray-400 text-xs">
                                                Aucun incident
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Titre</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Lieu</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Priorité</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {incidents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">Aucun incident</td>
                                </tr>
                            ) : (
                                incidents.map(incident => (
                                    <tr key={incident.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{incident.title}</td>
                                        <td className="px-4 py-3 text-gray-600">{incident.location || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2 py-0.5 text-xs font-medium rounded",
                                                incident.priority === 'urgente' ? "bg-red-100 text-red-700" :
                                                    incident.priority === 'haute' ? "bg-orange-100 text-orange-700" :
                                                        "bg-gray-100 text-gray-600"
                                            )}>
                                                {incident.priority || 'normale'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">{incident.status}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function IncidentCard({ incident }: any) {
    const priorityColors: Record<string, string> = {
        urgente: "text-red-700 bg-red-50",
        haute: "text-orange-700 bg-orange-50",
        moyenne: "text-blue-700 bg-blue-50",
        basse: "text-gray-700 bg-gray-50",
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-2">
                <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded", priorityColors[incident.priority] || "bg-gray-100")}>
                    {incident.priority || 'normale'}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    {incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleDateString() : '...'}
                </span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm mb-1">{incident.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{incident.description}</p>
            <div className="flex items-center text-[10px] text-gray-400">
                <MapPin className="h-2.5 w-2.5 mr-1" />
                {incident.location || 'Non spécifié'}
            </div>
        </motion.div>
    );
}
