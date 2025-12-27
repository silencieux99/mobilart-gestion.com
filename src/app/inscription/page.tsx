'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tower: '',
    floor: '',
    apartmentNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/residents/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          tempApartmentDetails: `Tour ${formData.tower} - Étage ${formData.floor} - Appt ${formData.apartmentNumber}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
      toast.success('Inscription réussie ! Votre compte est en attente de validation.');
      
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden font-sans">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tours.png"
            alt="Tours Mobilart - Résidence Oran"
            fill
            priority
            className="object-cover scale-105"
            quality={100}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-black/50 to-slate-900/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)]" />
        </div>

        {/* Success Message */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="backdrop-blur-2xl bg-white/5 border border-white/20 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto h-20 w-20 rounded-full bg-success-500/20 flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-10 w-10 text-success-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-4">Inscription réussie !</h2>
              <p className="text-white/70 mb-6">
                Votre demande d'inscription a été envoyée avec succès. Un administrateur va vérifier vos informations et valider votre compte sous peu.
              </p>
              <p className="text-white/60 text-sm mb-8">
                Vous recevrez un email de confirmation une fois votre compte validé.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tours.png"
          alt="Tours Mobilart - Résidence Oran"
          fill
          priority
          className="object-cover scale-105"
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-black/50 to-slate-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-end sm:items-center justify-center p-4 sm:p-6 lg:p-8 pb-8 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Glass Card - Compact sur mobile */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/20 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
            <div className="p-6 sm:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto h-16 w-16 rounded-xl bg-primary-500/90 flex items-center justify-center shadow-lg mb-6"
                >
                  <Building2 className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-lg">
                  Inscription Résident
                </h1>
                <p className="text-white/70">
                  Créez votre compte pour accéder à votre espace résident
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3 text-red-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="block text-white/70 text-sm font-medium mb-2">Prénom *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Votre prénom"
                      className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-white/70 text-sm font-medium mb-2">Nom *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white/70 text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="votre.email@exemple.com"
                      className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white/70 text-sm font-medium mb-2">Téléphone *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+213 XXX XXX XXX"
                      className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                {/* Informations appartement */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Informations Appartement
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Tour *</label>
                      <select
                        name="tower"
                        value={formData.tower}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="" className="bg-slate-800">Sélectionner</option>
                        <option value="A" className="bg-slate-800">Tour A</option>
                        <option value="B" className="bg-slate-800">Tour B</option>
                        <option value="C" className="bg-slate-800">Tour C</option>
                        <option value="D" className="bg-slate-800">Tour D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Étage *</label>
                      <input
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        required
                        min="1"
                        max="30"
                        placeholder="1-30"
                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                        style={{ fontSize: '16px' }}
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">N° Appt *</label>
                      <input
                        type="text"
                        name="apartmentNumber"
                        value={formData.apartmentNumber}
                        onChange={handleChange}
                        required
                        placeholder="01"
                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Sécurité
                  </h3>
                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="block text-white/70 text-sm font-medium mb-2">Mot de passe *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-white/50" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Minimum 8 caractères"
                          className="block w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                          style={{ fontSize: '16px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="block text-white/70 text-sm font-medium mb-2">Confirmer le mot de passe *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-white/50" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Confirmez votre mot de passe"
                          className="block w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-base"
                          style={{ fontSize: '16px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-white/5 border-t border-white/10 text-center">
              <p className="text-white/60 text-sm">
                Vous avez déjà un compte ?{' '}
                <Link href="/" className="text-white font-semibold hover:underline decoration-primary-400 decoration-2 underline-offset-4 transition-all">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
