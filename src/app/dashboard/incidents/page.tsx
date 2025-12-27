'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar,
    MapPin,
    User,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IncidentPriority, IncidentCategory } from '@/types';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const COLUMNS = [
    { id: 'nouveau', title: 'À Traiter', color: 'bg-red-500', statuses: ['nouveau'] },
    { id: 'en_cours', title: 'En Cours', color: 'bg-blue-500', statuses: ['en_cours', 'en_attente'] },
    { id: 'resolu', title: 'Résolu', color: 'bg-emerald-500', statuses: ['resolu', 'ferme', 'annule'] },
];

export default function IncidentsPage() {
    const [activeTab, setActiveTab] = useState('board'); // 'board' or 'list'
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
        <div className="space-y-8 h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Incidents & Maintenance
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Suivi des demandes d'intervention et travaux.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setActiveTab('board')}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", activeTab === 'board' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", activeTab === 'list' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Liste
                        </button>
                    </div>
                    <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all">
                        <Plus className="h-5 w-5" />
                        <span>Signaler</span>
                    </button>
                </div>
            </div>

            {/* Board View */}
            {activeTab === 'board' && (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-[1000px] h-full">
                        {COLUMNS.map((col) => {
                            const colIncidents = incidents.filter(i => col.statuses.includes(i.status));

                            return (
                                <div key={col.id} className="flex-1 flex flex-col min-w-[320px]">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("h-3 w-3 rounded-full", col.color)} />
                                            <h3 className="font-bold text-gray-700">{col.title}</h3>
                                            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {colIncidents.length}
                                            </span>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Cards Container */}
                                    <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                                        {colIncidents.map((incident) => (
                                            <IncidentCard key={incident.id} incident={incident} />
                                        ))}
                                        {colIncidents.length === 0 && (
                                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                                Aucun incident
                                            </div>
                                        )}
                                        <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium flex items-center justify-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Ajouter une carte
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* List View Placeholder (To be implemented later with real data table) */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-2">Titre</th>
                                    <th className="px-4 py-2">Localisation</th>
                                    <th className="px-4 py-2">Priorité</th>
                                    <th className="px-4 py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map(incident => (
                                    <tr key={incident.id} className="border-b">
                                        <td className="px-4 py-2">{incident.title}</td>
                                        <td className="px-4 py-2">{incident.location}</td>
                                        <td className="px-4 py-2">{incident.priority}</td>
                                        <td className="px-4 py-2">{incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function IncidentCard({ incident }: any) {
    const priorityColors: Record<string, string> = {
        urgente: "text-red-700 bg-red-50 border-red-100",
        haute: "text-orange-700 bg-orange-50 border-orange-100",
        moyenne: "text-blue-700 bg-blue-50 border-blue-100",
        basse: "text-gray-700 bg-gray-50 border-gray-100",
    };

    // Fallback for reportedBy if it's missing or just ID
    const reporterName = incident.reporterName || incident.reportedBy || "Anonyme";
    const dateDisplay = incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleDateString() : "Récemment";

    return (
        <motion.div
            layoutId={incident.id}
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border", priorityColors[incident.priority] || priorityColors['basse'])}>
                    {incident.priority || 'basse'}
                </span>
                <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {dateDisplay}
                </span>
            </div>

            <h4 className="font-bold text-gray-900 mb-1 leading-snug group-hover:text-primary-600 transition-colors">
                {incident.title}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {incident.description}
            </p>

            {incident.images && incident.images.length > 0 && (
                <div className="mb-3 rounded-lg overflow-hidden h-32 relative">
                    <img src={incident.images[0]} alt="Incident" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {incident.location ? incident.location.split('-')[0] : 'Inconnu'}
                </div>
                <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary-100 border border-white flex items-center justify-center text-[10px] font-bold text-primary-700" title={reporterName}>
                        {reporterName.charAt(0)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
