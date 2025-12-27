'use client';

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Download,
    Filter,
    Plus,
    CreditCard,
    PieChart as PieChartIcon,
    TrendingUp,
    MoreVertical,
    CheckCircle2,
    Clock,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { InvoiceStatus } from '@/types';

export default function FinancePage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0
    });

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                // Fetch recent invoices
                const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const fetchedInvoices: any[] = [];
                let totalInfo = 0;
                let monthRev = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedInvoices.push({ id: doc.id, ...data });

                    // Simple stats calculation logic
                    // This should ideally be done server-side or via aggregated stats document
                    if (data.status === 'paid') {
                        totalInfo += (data.amount || 0);
                        // Check if current month (mock logic for now for "monthly")
                        // const isCurrentMonth = ...
                        monthRev += (data.amount || 0);
                    }
                });

                setInvoices(fetchedInvoices);
                setStats({
                    totalBalance: totalInfo,
                    monthlyRevenue: monthRev, // Simplified
                    monthlyExpenses: 0 // No expenses collection yet
                });

            } catch (error) {
                console.error("Error fetching finance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Finances
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Suivi de la trésorerie, facturation et dépenses de la copropriété.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all">
                        <Download className="h-5 w-5" />
                        <span className="hidden sm:inline">Exporter</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5">
                        <Plus className="h-5 w-5" />
                        <span>Nouvelle Facture</span>
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceCard
                    title="Solde Total"
                    amount={`${stats.totalBalance.toLocaleString()} DA`}
                    trend="+0%"
                    trendUp={true}
                    icon={Wallet}
                    color="blue"
                />
                <FinanceCard
                    title="Revenus ce mois"
                    amount={`${stats.monthlyRevenue.toLocaleString()} DA`}
                    trend="+0%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="emerald"
                />
                <FinanceCard
                    title="Dépenses ce mois"
                    amount="0 DA"
                    trend="+0%"
                    trendUp={false}
                    icon={CreditCard}
                    color="red"
                    info="Aucune donnée"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Flux Financiers</h3>
                            <p className="text-sm text-gray-500">Comparatif Revenus vs Dépenses</p>
                        </div>
                        <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg cursor-pointer focus:ring-0">
                            <option>Cette année</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <p className="text-gray-400">Aucune donnée historique disponible</p>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Répartition Dépenses</h3>
                    <div className="h-[200px] w-full relative flex items-center justify-center bg-gray-50 rounded-xl">
                        <p className="text-gray-400">Aucune dépense</p>
                        {/* Center Text is hidden if no data */}
                    </div>
                </div>
            </div>

            {/* Recent Transactions / Invoices Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Factures Récentes</h3>
                        <p className="text-sm text-gray-500">Dernières transactions enregistrées</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <button className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Facture</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Destinataire</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        Aucune facture trouvée.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice, index) => (
                                    <motion.tr
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber || invoice.id}</p>
                                                    <p className="text-xs text-gray-500">{invoice.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 hidden md:table-cell">
                                            <p className="text-sm font-medium text-gray-900">User {invoice.userId}</p>
                                            <p className="text-xs text-gray-500">{invoice.apartmentId}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 hidden lg:table-cell">
                                            {invoice.createdAt?.toDate ? invoice.createdAt.toDate().toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">
                                            {invoice.amount} DA
                                        </td>
                                        <td className="py-4 px-6 hidden sm:table-cell">
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function FinanceCard({ title, amount, trend, trendUp, icon: Icon, color, info }: any) {
    const colorStyles: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className={cn("p-2 sm:p-3 rounded-xl", colorStyles[color])}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className={cn(
                    "flex items-center px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold",
                    trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 tracking-tight truncate" title={amount}>{amount}</h3>
                {info && <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">{info}</p>}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        overdue: "bg-red-100 text-red-700 border-red-200",
    };

    const labels: Record<string, string> = {
        paid: "Payée",
        pending: "En attente",
        overdue: "En retard",
    };

    // Helper for icon
    const icons: Record<string, any> = {
        paid: CheckCircle2,
        pending: Clock,
        overdue: AlertCircleIcon,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border", styles[status] || "bg-gray-100 text-gray-700")}>
            <Icon className="h-3 w-3 mr-1" />
            {labels[status] || status}
        </span>
    );
}

function AlertCircleIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

function Search(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}
