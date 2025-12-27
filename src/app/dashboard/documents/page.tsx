'use client';

import React, { useState, useEffect } from 'react';
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
    HardDrive,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog';
import { toast } from 'sonner';

interface Document {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    category: string;
    description?: string;
    uploadedByName: string;
    createdAt: any;
}

export default function DocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/documents/list');
            const data = await response.json();
            
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Erreur lors du chargement des documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileType = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
        return 'file';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const categoryFolders = [
        { id: 'pv_ag', name: 'PV Assemblées', count: documents.filter(d => d.category === 'pv_ag').length },
        { id: 'reglement', name: 'Règlements', count: documents.filter(d => d.category === 'reglement').length },
        { id: 'contrat', name: 'Contrats', count: documents.filter(d => d.category === 'contrat').length },
        { id: 'facture', name: 'Factures', count: documents.filter(d => d.category === 'facture').length },
    ];

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
                    <button 
                        onClick={() => setUploadDialogOpen(true)}
                        className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
                    >
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
                        <p className="text-sm text-gray-500">{documents.length} documents • Vercel Blob</p>
                    </div>
                </div>
            </div>

            {/* Folders Row */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Catégories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryFolders.map((folder) => (
                        <div
                            key={folder.id}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Folder className="h-8 w-8 text-primary-200 group-hover:text-primary-500 transition-colors fill-current" />
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
                    <h3 className="text-lg font-bold text-gray-900">Tous les Documents</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20" 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Chargement...</div>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun document trouvé</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredDocuments.map((doc, i) => (
                            <FileCardGrid 
                                key={doc.id} 
                                file={{
                                    id: doc.id,
                                    name: doc.title,
                                    type: getFileType(doc.mimeType),
                                    size: formatFileSize(doc.fileSize),
                                    date: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
                                    url: doc.fileUrl
                                }} 
                                index={i} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Uploadé par</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Taille</th>
                                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <FileIcon type={getFileType(doc.mimeType)} />
                                                <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-600">{doc.uploadedByName}</td>
                                        <td className="py-3 px-6 text-sm text-gray-600">
                                            {format(doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt), 'dd MMM yyyy')}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-600">{formatFileSize(doc.fileSize)}</td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a 
                                                    href={doc.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-gray-200 rounded text-gray-500"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <a 
                                                    href={doc.fileUrl} 
                                                    download
                                                    className="p-2 hover:bg-gray-200 rounded text-gray-500"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <UploadDocumentDialog 
                isOpen={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onSuccess={fetchDocuments}
            />
        </div>
    );
}

function FileCardGrid({ file, index }: { file: { id: string; name: string; type: string; size: string; date: Date; url: string }, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
        >
            <div className="flex justify-between items-start mb-4">
                <FileIcon type={file.type} size="lg" />
                <div className="flex gap-1">
                    <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                    <a 
                        href={file.url} 
                        download
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                        <Download className="h-4 w-4 text-gray-400" />
                    </a>
                </div>
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
