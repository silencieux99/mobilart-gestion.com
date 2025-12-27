'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    AlertCircle,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    FileCheck,
    MoreVertical,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { collection, query, where, getCountFromServer, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserRole, IncidentStatus } from '@/types';
import CommunityChatbox from '@/components/community/CommunityChatbox';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        residents: 0,
        activeIncidents: 0,
        occupancyRate: 0,
        pendingTasks: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Residents Count
                const residentsUniqueQuery = query(collection(db, 'users'), where('role', '==', 'resident'));
                const residentsSnapshot = await getCountFromServer(residentsUniqueQuery);
                const residentsCount = residentsSnapshot.data().count;

                // 2. Fetch Active Incidents Count
                const incidentsQuery = query(
                    collection(db, 'incidents'),
                    where('status', 'in', ['nouveau', 'en_cours', 'en_attente'])
                );
                const incidentsSnapshot = await getCountFromServer(incidentsQuery);
                const activeIncidentsCount = incidentsSnapshot.data().count;

                // 3. Approximate Occupancy Rate (Simplification for now: residents / 100 * 100)
                // In a real scenario, fetch total apartments vs occupied apartments
                const occupancyRate = Math.min(Math.round((residentsCount / 60) * 100), 100); // Assuming 60 apartments for now or we fetch apartments count

                // 4. Fetch Recent Activity (Mix of new users and recent incidents)
                // Since Firestore doesn't support union queries easily across collections, we fetch separately and merge
                const recentUsersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(3));
                const recentIncidentsQuery = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(3));

                const [usersDocs, incidentsDocs] = await Promise.all([
                    getDocs(recentUsersQuery),
                    getDocs(recentIncidentsQuery)
                ]);

                const activities: any[] = [];

                usersDocs.forEach(doc => {
                    const data = doc.data();
                    activities.push({
                        id: doc.id,
                        type: 'user',
                        title: 'Nouveau résident',
                        description: `${data.firstName} ${data.lastName} a rejoint la résidence`,
                        time: data.createdAt // timestamp
                    });
                });

                incidentsDocs.forEach(doc => {
                    const data = doc.data();
                    activities.push({
                        id: doc.id,
                        type: 'incident',
                        title: 'Incident signalé',
                        description: `${data.title} (${data.category})`,
                        time: data.createdAt
                    });
                });

                // Sort by time desc
                activities.sort((a, b) => {
                    const timeA = a.time?.toMillis ? a.time.toMillis() : 0;
                    const timeB = b.time?.toMillis ? b.time.toMillis() : 0;
                    return timeB - timeA;
                });

                setRecentActivity(activities.slice(0, 5));

                setStats({
                    residents: residentsCount,
                    activeIncidents: activeIncidentsCount,
                    occupancyRate,
                    pendingTasks: 0
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome & Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Tableau de bord
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Bienvenue sur votre espace de gestion Mobilart.
                    </p>
                </div>
                <Link href="/dashboard/communication">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-all">
                        + Nouvelle Annonce
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Revenu Mensuel"
                    value="0 DA" // Placeholder until Finance module is connected
                    trend="0%"
                    trendUp={true}
                    icon={Wallet}
                    color="emerald"
                />
                <StatCard
                    title="Incidents Actifs"
                    value={stats.activeIncidents.toString()}
                    trend={stats.activeIncidents > 0 ? "+1" : "0"}
                    trendUp={false}
                    icon={AlertCircle}
                    color="red"
                />
                <StatCard
                    title="Taux d'Occupation"
                    value={`${stats.occupancyRate}%`}
                    trend="+0%"
                    trendUp={true}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title="Résidents"
                    value={stats.residents.toString()}
                    trend="+1"
                    trendUp={true}
                    icon={Users}
                    color="purple"
                />
            </div>

            {/* Analytics Row - Empty States if no data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <h3 className="font-bold text-gray-900 text-lg">Revenus perçus</h3>
                        <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg cursor-pointer focus:ring-0 w-full sm:w-auto">
                            <option>Cette année</option>
                        </select>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-sm">Aucune donnée financière disponible</p>
                    </div>
                </div>

                {/* Incidents Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Incidents par catégorie</h3>
                    <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-sm">Aucune donnée d'incident disponible</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Activities & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-lg">Activité Récente</h3>
                        <Link href="#" className="text-sm text-primary-600 font-medium hover:text-primary-700">Tout voir</Link>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4 sm:space-y-6">
                            {recentActivity.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">Aucune activité récente</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-3 sm:gap-4">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-600 shrink-0">
                                            {activity.type === 'user' ? 'U' : 'I'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 space-x-1">
                                                <span className="font-semibold">{activity.title}</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {/* Simple date formatter */}
                                                {activity.time?.toDate ? activity.time.toDate().toLocaleDateString() : 'Récemment'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Community Chat */}
                <div className="space-y-6">
                    <CommunityChatbox compact />

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/finance">
                            <QuickActionCard
                                icon={FileCheck}
                                label="Créer une Facture"
                                color="bg-emerald-50 text-emerald-600"
                            />
                        </Link>
                        <Link href="/dashboard/residents">
                            <QuickActionCard
                                icon={Users}
                                label="Ajouter un Résident"
                                color="bg-blue-50 text-blue-600"
                            />
                        </Link>
                        <Link href="/dashboard/incidents">
                            <QuickActionCard
                                icon={AlertCircle}
                                label="Voir Incidents"
                                color="bg-amber-50 text-amber-600"
                            />
                        </Link>
                        <Link href="/dashboard/communication">
                            <QuickActionCard
                                icon={MoreVertical}
                                label="Communication"
                                color="bg-gray-50 text-gray-600"
                            />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-components for cleaner code
function StatCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
    const colorStyles: Record<string, string> = {
        emerald: "bg-emerald-100 text-emerald-600",
        red: "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className={cn("p-2 sm:p-3 rounded-xl", colorStyles[color] || "bg-gray-100 text-gray-600")}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className={cn(
                    "flex items-center space-x-1 text-xs sm:text-sm font-medium px-2 py-1 rounded-lg",
                    trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                )}>
                    {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{trend}</span>
                </div>
            </div>
            <div className="mt-3 sm:mt-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate" title={value}>{value}</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{title}</p>
            </div>
        </div>
    );
}

function TaskItem({ label, urgency }: { label: string, urgency: 'high' | 'medium' | 'low' }) {
    const borderColors = {
        high: "border-l-red-500",
        medium: "border-l-amber-500",
        low: "border-l-blue-500",
    };

    return (
        <div className={cn("flex items-center p-3 bg-gray-50 border-l-4 rounded-r-lg hover:bg-gray-100 transition-colors cursor-pointer", borderColors[urgency])}>
            <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{label}</p>
            </div>
            <button className="text-gray-400 hover:text-primary-600 transition-colors shrink-0">
                <CheckCircle2 className="h-5 w-5" />
            </button>
        </div>
    );
}

function QuickActionCard({ icon: Icon, label, color }: any) {
    return (
        <button className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95", color)}>
            <Icon className="h-6 w-6 mb-2" />
            <span className="text-xs sm:text-sm font-bold text-center leading-tight">{label}</span>
        </button>
    );
}
