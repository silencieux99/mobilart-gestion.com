'use client';

import React, { useState } from 'react';
import {
    Folder,
    FileText,
    MoreVertical,
    Search,
    UploadCloud,
    Download,
    File,
    Grid,
    List,
    Clock,
    HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock Data
const FOLDERS = [
    { id: 1, name: 'PV Assemblées', count: 12 },
    { id: 2, name: 'Règlements', count: 4 },
    { id: 3, name: 'Contrats Maintenance', count: 8 },
    { id: 4, name: 'Factures Fournisseurs', count: 45 },
];

const FILES = [
    {
        id: 1,
        name: 'PV_AG_Juin_2024.pdf',
        type: 'pdf',
        size: '2.4 MB',
        date: new Date(2024, 5, 15),
        folderId: 1
    },
    {
        id: 2,
        name: 'Reglement_Interieur_V2.pdf',
        type: 'pdf',
        size: '1.8 MB',
        date: new Date(2024, 0, 10),
        folderId: 2
    },
    {
        id: 3,
        name: 'Contrat_Ascenseur_Otis.docx',
        type: 'doc',
        size: '450 KB',
        date: new Date(2024, 2, 5),
        folderId: 3
    },
    {
        id: 4,
        name: 'Budget_Previsionnel_2024.xlsx',
        type: 'xls',
        size: '85 KB',
        date: new Date(2023, 11, 20),
        folderId: 1
    },
];

export default function DocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                        Documents
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Base documentaire de la copropriété (PV, Contrats, Règlements...)
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                    <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5">
                        <UploadCloud className="h-5 w-5" />
                        <span>Uploader</span>
                    </button>
                </div>
            </div>

            {/* Storage Status */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <HardDrive className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Espace de Stockage</h3>
                        <p className="text-sm text-gray-500">4.2 GB utilisés sur 10 GB</p>
                    </div>
                </div>
                <div className="w-1/3 max-w-xs hidden sm:block">
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[42%] rounded-full" />
                    </div>
                </div>
            </div>

            {/* Folders Row */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dossiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {FOLDERS.map((folder) => (
                        <div
                            key={folder.id}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Folder className="h-8 w-8 text-primary-200 group-hover:text-primary-500 transition-colors fill-current" />
                                <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="h-4 w-4" /></button>
                            </div>
                            <h4 className="font-semibold text-gray-900 truncate">{folder.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{folder.count} fichiers</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Files Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Fichiers Récents</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Filtrer..." className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20" />
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FILES.map((file, i) => (
                            <FileCardGrid key={file.id} file={file} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Propriétaire</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Taille</th>
                                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {FILES.map((file) => (
                                    <tr key={file.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <FileIcon type={file.type} />
                                                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-600">Admin</td>
                                        <td className="py-3 px-6 text-sm text-gray-600">{format(file.date, 'dd MMM yyyy')}</td>
                                        <td className="py-3 px-6 text-sm text-gray-600">{file.size}</td>
                                        <td className="py-3 px-6 text-right">
                                            <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><Download className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function FileCardGrid({ file, index }: { file: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
        >
            <div className="flex justify-between items-start mb-4">
                <FileIcon type={file.type} size="lg" />
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
            </div>
            <h4 className="font-medium text-gray-900 text-sm truncate mb-1" title={file.name}>{file.name}</h4>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">{file.size}</span>
                <span className="text-xs text-gray-400">{format(file.date, 'dd MMM')}</span>
            </div>
        </motion.div>
    );
}

function FileIcon({ type, size = 'sm' }: { type: string, size?: 'sm' | 'lg' }) {
    const isLg = size === 'lg';
    const sizeClass = isLg ? "w-10 h-10" : "w-8 h-8";

    if (type === 'pdf') {
        return <div className={cn("rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm", sizeClass)}>PDF</div>;
    }
    if (type === 'doc') {
        return <div className={cn("rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm", sizeClass)}>DOC</div>;
    }
    if (type === 'xls') {
        return <div className={cn("rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm", sizeClass)}>XLS</div>;
    }
    return <div className={cn("rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs shadow-sm", sizeClass)}>FILE</div>;
}
