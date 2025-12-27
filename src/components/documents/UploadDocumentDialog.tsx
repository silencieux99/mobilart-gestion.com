'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CATEGORIES = [
    { value: 'reglement', label: 'Règlement' },
    { value: 'pv_ag', label: 'PV Assemblée Générale' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'plan', label: 'Plan' },
    { value: 'facture', label: 'Facture' },
    { value: 'attestation', label: 'Attestation' },
    { value: 'autre', label: 'Autre' },
];

export function UploadDocumentDialog({ isOpen, onClose, onSuccess }: UploadDocumentDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('autre');
    const [isPublic, setIsPublic] = useState(true);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) {
                setTitle(selectedFile.name);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('isPublic', isPublic.toString());
            formData.append('uploadedById', 'admin'); // TODO: Get from auth
            formData.append('uploadedByName', 'Admin'); // TODO: Get from auth

            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }

            toast.success('Document uploadé avec succès !');
            
            // Reset form
            setFile(null);
            setTitle('');
            setDescription('');
            setCategory('autre');
            setIsPublic(true);
            
            onSuccess?.();
            onClose();

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Erreur lors de l\'upload du document');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Uploader un document</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={uploading}
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fichier *
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer"
                            >
                                {file ? (
                                    <>
                                        <FileText className="h-6 w-6 text-primary-600" />
                                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-gray-400" />
                                        <span className="text-sm text-gray-600">Cliquez pour sélectionner un fichier</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Titre *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            placeholder="Nom du document"
                            required
                            disabled={uploading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                            placeholder="Description du document (optionnel)"
                            rows={3}
                            disabled={uploading}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Catégorie *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            required
                            disabled={uploading}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Public/Private */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            disabled={uploading}
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700">
                            Visible par tous les résidents
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all"
                            disabled={uploading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={uploading || !file}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Upload en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Uploader
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
