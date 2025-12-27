'use client';

import React, { useState } from 'react';
import {
    Megaphone,
    Send,
    Plus,
    Users,
    Clock,
    Image as ImageIcon,
    MoreVertical,
    Search,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock Data
const ANNOUNCEMENTS = [
    {
        id: 1,
        title: "Coupure d'eau programmée Tour A",
        content: "Une maintenance des pompes hydrauliques nécessitera une coupure d'eau ce Mardi 25 Juin de 10h à 14h. Merci de prendre vos dispositions.",
        author: "Administration",
        date: "Il y a 2 heures",
        audience: "Résidents Tour A",
        status: "published",
        views: 145,
        category: "Maintenance"
    },
    {
        id: 2,
        title: "Invitation : Assemblée Générale Annuelle",
        content: "Nous vous convions à l'AG ordinaire qui se tiendra le 15 Juillet à 18h dans la salle des fêtes. L'ordre du jour est disponible en pièce jointe.",
        author: "Le Syndic",
        date: "Il y a 2 jours",
        audience: "Tous les propriétaires",
        status: "published",
        views: 890,
        category: "Administration"
    },
    {
        id: 3,
        title: "Rappel : Consignes de tri sélectif",
        content: "Nous rappelons qu'il est interdit de jeter les cartons volumineux dans le vide-ordures. Veuillez utiliser le local dédié au rez-de-chaussée.",
        author: "Service Nettoyage",
        date: "Il y a 1 semaine",
        audience: "Tous les résidents",
        status: "archived",
        views: 1205,
        category: "Règlement"
    }
];

export default function CommunicationPage() {
    const [activeTab, setActiveTab] = useState('annonces');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Communication
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gérez la diffusion d'informations et les échanges avec les résidents.
                    </p>
                </div>
                <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5">
                    <Plus className="h-5 w-5" />
                    <span>Nouvelle Annonce</span>
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Feed & List */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tabs & Search */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('annonces')}
                                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'annonces' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                            >
                                Annonces
                            </button>
                            <button
                                onClick={() => setActiveTab('newsletter')}
                                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'newsletter' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                            >
                                Newsletter
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary-500/20" />
                        </div>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-4">
                        {ANNOUNCEMENTS.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                            item.category === 'Maintenance' ? "bg-blue-50 text-blue-600" :
                                                item.category === 'Administration' ? "bg-purple-50 text-purple-600" :
                                                    "bg-orange-50 text-orange-600"
                                        )}>
                                            <Megaphone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                                Publié par {item.author} • {item.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium border",
                                            item.status === 'published' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-600 border-gray-100"
                                        )}>
                                            {item.status === 'published' ? 'Publié' : 'Archivé'}
                                        </span>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    {item.content}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            {item.audience}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            {item.views} vues
                                        </span>
                                    </div>
                                    <button className="text-primary-600 font-medium hover:underline">Voir détails</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Quick Stats & Drafts */}
                <div className="space-y-6">

                    {/* Quick Stats */}
                    <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-600/20">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Impact Communication
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2 opacity-90">
                                    <span>Taux d'ouverture</span>
                                    <span className="font-bold">68%</span>
                                </div>
                                <div className="h-2 bg-primary-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[68%] rounded-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-primary-500/50 p-3 rounded-xl">
                                    <p className="text-2xl font-bold">12</p>
                                    <p className="text-xs opacity-75">Campagnes ce mois</p>
                                </div>
                                <div className="bg-primary-500/50 p-3 rounded-xl">
                                    <p className="text-2xl font-bold">4.8k</p>
                                    <p className="text-xs opacity-75">Total Vues</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Brouillons Récents</h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                                <p className="text-sm font-semibold text-gray-900 mb-1">Travaux Façade Sud</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Modifié il y a 2h</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200">Brouillon</span>
                                </div>
                            </div>
                            <button className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-primary-600 rounded-xl transition-all border border-dashed border-gray-300">
                                + Nouveau brouillon
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
