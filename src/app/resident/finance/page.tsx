'use client';

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    FileText,
    CheckCircle2,
    Clock,
    Download,
    CreditCard,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function ResidentFinancePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unpaidTotal, setUnpaidTotal] = useState(0);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, 'invoices'),
                    // where('userId', '==', user.uid), // Uncomment when userId is properly populated in invoices
                    orderBy('createdAt', 'desc')
                );

                const unsubscribeData = onSnapshot(q, (snapshot) => {
                    // Filter manually for now if userId isn't always set or to mock viewing all for demo
                    // const fetchedInvoices = snapshot.docs.filter(d => d.data().userId === user.uid)...
                    // Lets just take all for demo purposes or filter if 'userId' exists

                    const fetchedInvoices = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const unpaid = fetchedInvoices
                        .filter((inv: any) => inv.status !== 'paid')
                        .reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);

                    setInvoices(fetchedInvoices);
                    setUnpaidTotal(unpaid);
                    setLoading(false);
                });
                return () => unsubscribeData();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">
                        Mes Finances & Charges
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Consultez vos appels de fonds et l'historique de vos paiements.
                    </p>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <p className="text-gray-300 text-sm font-medium mb-1">Total à régler</p>
                    <h2 className="text-4xl font-bold tracking-tight">{unpaidTotal.toLocaleString()} DA</h2>
                    {unpaidTotal > 0 ? (
                        <p className="text-orange-300 text-sm mt-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {invoices.filter(i => i.status !== 'paid').length} facture(s) en attente
                        </p>
                    ) : (
                        <p className="text-emerald-300 text-sm mt-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Vous êtes à jour
                        </p>
                    )}
                </div>
                {unpaidTotal > 0 && (
                    <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <CreditCard className="h-5 w-5" />
                        Payer la totalité
                    </button>
                )}
            </div>

            {/* Invoices List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-700">Historique des transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Aucune facture disponible.</div>
                    ) : (
                        invoices.map((invoice) => (
                            <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl",
                                        invoice.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                                    )}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {invoice.type === 'charges_mensuelles' ? 'Charges de Copropriété' : invoice.description || 'Facture'}
                                        </h4>
                                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                            {invoice.createdAt?.toDate ? invoice.createdAt.toDate().toLocaleDateString() : 'Date inconnue'} • #{invoice.invoiceNumber || invoice.id.substring(0, 8)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{invoice.amount} DA</p>
                                        <StatusBadge status={invoice.status} />
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Télécharger">
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'paid') {
        return (
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Payé
            </span>
        );
    }
    return (
        <span className="inline-flex items-center text-xs font-medium text-orange-600">
            <Clock className="h-3 w-3 mr-1" /> En attente
        </span>
    );
}
