'use client';

import React, { useState, useEffect } from 'react';
import {
    Home,
    Wallet,
    AlertCircle,
    Bell,
    Plus,
    Calendar,
    ArrowRight,
    Megaphone,
    CheckCircle2,
    Clock,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

export default function ResidentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        balance: 0,
        activeIncidents: 0,
        pendingReservations: 0
    });
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [myIncidents, setMyIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // 1. Fetch Active Incidents
                    const incQuery = query(
                        collection(db, 'incidents'),
                        where('reporterId', '==', currentUser.uid),
                        where('status', 'in', ['nouveau', 'en_cours', 'en_attente']),
                        limit(5)
                    );
                    const incSnap = await getDocs(incQuery);
                    const activeIncidentsCount = incSnap.size;
                    const incidentsList = incSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // 2. Fetch User Balance (Sum of unpaid invoices)
                    const invoicesQuery = query(
                        collection(db, 'invoices'),
                        where('userId', '==', currentUser.uid),
                        where('status', '!=', 'paid')
                    );
                    // Note: 'status' != 'paid' might require an index or client-side filtering if composite index missing.
                    // To be safe and avoid index creation requirement errors immediately, let's fetch by user and filter client side or use basic query.
                    // simpler: fetch all user invoices and filter in memory since volume per user is low.

                    const userInvoicesQuery = query(
                        collection(db, 'invoices'),
                        where('userId', '==', currentUser.uid)
                    );
                    const invoiceSnap = await getDocs(userInvoicesQuery);
                    const unpaidBalance = invoiceSnap.docs
                        .filter(doc => doc.data().status !== 'paid')
                        .reduce((sum, doc) => sum + (Number(doc.data().amount) || 0), 0);

                    // 3. Fetch Pending Reservations
                    // Assuming 'reservations' collection exists. If not, this will just return empty.
                    const resQuery = query(
                        collection(db, 'reservations'),
                        where('userId', '==', currentUser.uid),
                        where('status', 'in', ['pending', 'confirmed', 'en_attente'])
                    );
                    // Wrap in try/catch in case collection doesn't exist or other error
                    let pendingReservationsCount = 0;
                    try {
                        const resSnap = await getDocs(resQuery);
                        pendingReservationsCount = resSnap.size;
                    } catch (e) {
                        console.log("Reservations collection might not exist yet", e);
                    }

                    setStats({
                        balance: unpaidBalance,
                        activeIncidents: activeIncidentsCount,
                        pendingReservations: pendingReservationsCount
                    });
                    setMyIncidents(incidentsList);

                    // 4. Latest Announcements
                    const annQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(1));
                    const annSnap = await getDocs(annQuery);
                    const anns = annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setAnnouncements(anns);

                } catch (error) {
                    console.error("Error fetching resident data", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header / Welcome */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Mon Espace
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gérez votre logement et vos services en toute simplicité.
                    </p>
                </div>
            </motion.div>

            {/* Quick Stats / Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Balance Card - Highlighted */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                À payer
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-primary-100 text-sm font-medium">Charges du mois</p>
                            <h3 className="text-3xl font-bold tracking-tight mt-1">
                                {stats.balance.toLocaleString()} DA
                            </h3>
                        </div>
                        <Link href="/resident/finance" className="mt-6 w-full py-2.5 bg-white text-primary-700 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <CreditCard className="w-4 h-4" />
                            Payer maintenant
                        </Link>
                    </div>
                </motion.div>

                {/* My Incidents */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full",
                                stats.activeIncidents > 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                            )}>
                                {stats.activeIncidents} Actif{stats.activeIncidents > 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Incidents signalés</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-4">
                            {stats.activeIncidents}
                        </h3>
                        <Link href="/resident/incidents" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                            Voir le suivi <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Reservations */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Réservations</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-4">
                            {stats.pendingReservations > 0 ? `${stats.pendingReservations} En attente` : 'Aucune'}
                        </h3>
                        <Link href="/resident/reservation" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Réserver un espace <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Announcement */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-gray-500" />
                        Dernières Annonces
                    </h3>

                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-3 uppercase tracking-wide">
                                    {ann.category || 'Information'}
                                </span>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{ann.title}</h4>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {ann.content}
                                </p>
                                <div className="flex items-center text-xs text-gray-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Récemment'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
                            Aucune annonce pour le moment.
                        </div>
                    )}

                    {/* Quick Access Menu (Mobile Friendly Grid) */}
                    <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Accès Rapide</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <QuickAction href="/resident/incidents" icon={AlertCircle} text="Signaler Incident" color="bg-orange-50 text-orange-600" />
                        <QuickAction href="/resident/finance" icon={Wallet} text="Mes Factures" color="bg-emerald-50 text-emerald-600" />
                        <QuickAction href="/resident/reservation" icon={Calendar} text="Réserver" color="bg-blue-50 text-blue-600" />
                        <QuickAction href="/resident/documents" icon={Home} text="Mes Documents" color="bg-purple-50 text-purple-600" />
                    </div>

                </motion.div>

                {/* My Recent Activity / Notifications Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-500" />
                        Suivi d'activité
                    </h3>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                        {myIncidents.length > 0 ? (
                            myIncidents.map(inc => (
                                <div key={inc.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {inc.status === 'resolu' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{inc.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 capitalize">{inc.status.replace('_', ' ')} • {inc.category}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-gray-500">
                                Aucune activité récente
                            </div>
                        )}
                        <Link href="/resident/incidents" className="block p-4 text-center text-sm font-medium text-primary-600 hover:bg-gray-50 hover:text-primary-700 transition-colors">
                            Voir tout l'historique
                        </Link>
                    </div>

                    {/* Contact Manager Banner */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
                            <p className="text-gray-300 text-sm mb-4">Contacter la gestion directement.</p>
                            <Link href="/resident/messages" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors inline-block">
                                Contacter
                            </Link>
                        </div>
                        {/* Abstract decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full translate-x-10 -translate-y-10 opacity-50" />
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
}

function QuickAction({ href, icon: Icon, text, color }: any) {
    return (
        <Link href={href} className={cn("flex flex-col items-center justify-center p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm border border-transparent hover:border-gray-100 hover:shadow-md bg-white group")}>
            <div className={cn("p-3 rounded-xl mb-3 transition-colors", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center group-hover:text-primary-600 transition-colors">{text}</span>
        </Link>
    );
}
