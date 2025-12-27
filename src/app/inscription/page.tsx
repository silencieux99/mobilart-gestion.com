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
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
    occupancyType: '',
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
      // 1. Créer l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Mettre à jour le profil
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // 3. Créer le document utilisateur dans Firestore avec statut "pending"
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'resident',
        occupancyType: formData.occupancyType, // owner | tenant
        status: 'active',
        tempApartmentDetails: `Tour ${formData.tower} - Étage ${formData.floor} - Appt ${formData.apartmentNumber}`,
        createdAt: new Date(),
        isActive: true,
        notificationPreferences: {
          email: true,
          sms: false,
          push: true
        },
        newsletterSubscribed: false,
        registeredAt: new Date(),
        validatedAt: new Date(),
        validatedBy: 'auto',
      });

      // 4. Envoyer les emails via l'API
      try {
        await fetch('/api/residents/register-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            tempApartmentDetails: `Tour ${formData.tower} - Étage ${formData.floor} - Appt ${formData.apartmentNumber}`,
            userId: user.uid,
          }),
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue même si l'email échoue
      }

      // 5. Déconnecter l'utilisateur (il doit attendre la validation)
      await auth.signOut();

      setSuccess(true);
      toast.success('Inscription réussie ! Votre compte est en attente de validation.');

      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Un compte avec cet email existe déjà';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }

      setError(errorMessage);
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
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/tours.png"
          alt="Tours Mobilart - Résidence Oran"
          fill
          priority
          className="object-cover"
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Content - Scrollable with keyboard support */}
      <div className="relative z-10 min-h-screen overflow-y-auto">
        <div className="min-h-screen flex items-end sm:items-center justify-center p-4 sm:p-6 lg:p-8 pb-safe">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg sm:max-w-2xl mb-4 sm:mb-0"
          >
            {/* Glass Card Minimal */}
            <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="p-4 sm:p-8">
                {/* Header Minimal */}
                <div className="text-center mb-4 sm:mb-6">
                  <h1 className="text-lg sm:text-2xl font-display font-bold text-white mb-1">
                    Inscription
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm">
                    Créez votre compte résident
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

                {/* Form Minimal */}
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Prénom"
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Nom"
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                    style={{ fontSize: '16px' }}
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Téléphone"
                    className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                    style={{ fontSize: '16px' }}
                  />

                  {/* Type d'occupation */}
                  <div className="relative">
                    <select
                      name="occupancyType"
                      value={formData.occupancyType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base appearance-none"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="" className="bg-slate-800 text-gray-400">Je suis...</option>
                      <option value="owner" className="bg-slate-800">Propriétaire</option>
                      <option value="tenant" className="bg-slate-800">Locataire</option>
                    </select>
                    <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-white/40 pointer-events-none" />
                  </div>

                  {/* Appartement - Ligne simple */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <select
                      name="tower"
                      value={formData.tower}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="" className="bg-slate-800">Tour</option>
                      <option value="A" className="bg-slate-800">Tour A</option>
                      <option value="B" className="bg-slate-800">Tour B</option>
                      <option value="C" className="bg-slate-800">Tour C</option>
                      <option value="D" className="bg-slate-800">Tour D</option>
                    </select>

                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      required
                      min="1"
                      max="30"
                      placeholder="Étage"
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />

                    <input
                      type="text"
                      name="apartmentNumber"
                      value={formData.apartmentNumber}
                      onChange={handleChange}
                      required
                      placeholder="N°"
                      className="w-full px-3 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {/* Mot de passe */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Mot de passe (8+ caractères)"
                      className="w-full pl-3 pr-10 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirmer le mot de passe"
                      className="w-full pl-3 pr-10 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:bg-white/10 transition-all text-sm sm:text-base"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-400 text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "S'inscrire"
                    )}
                  </button>
                </form>

                {/* Footer Minimal */}
                <div className="text-center mt-4 pb-2">
                  <p className="text-white/50 text-xs">
                    Déjà un compte ?
                    <Link href="/" className="text-white/80 font-medium hover:text-white ml-1">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
