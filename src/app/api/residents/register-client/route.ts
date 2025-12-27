import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'contact@mobilart-gestion.com',
        pass: process.env.EMAIL_PASS
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, tempApartmentDetails, userId } = body;

        // L'utilisateur a déjà été créé côté client avec Firebase Auth
        // On enregistre juste les métadonnées supplémentaires

        // Envoyer un email de confirmation au résident
        const residentMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Demande d\'inscription reçue - Mobilart Gestion',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #06B6D4;">Demande d'inscription reçue</h2>
                    <p>Bonjour ${firstName} ${lastName},</p>
                    <p>Nous avons bien reçu votre demande d'inscription pour accéder à votre espace résident Mobilart.</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Informations de votre demande :</p>
                        <p style="margin: 10px 0 0 0;">Email : <strong>${email}</strong></p>
                        <p style="margin: 5px 0 0 0;">Téléphone : <strong>${phone}</strong></p>
                        <p style="margin: 5px 0 0 0;">Appartement : <strong>${tempApartmentDetails}</strong></p>
                    </div>

                    <p>Votre demande est en cours de vérification par notre équipe administrative. Vous recevrez un email de confirmation une fois votre compte validé.</p>
                    
                    <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                        Ce processus peut prendre 24 à 48 heures. Merci de votre patience.
                    </p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #6B7280;">
                        Ceci est un message automatique, merci de ne pas y répondre directement.
                    </p>
                </div>
            `
        };

        // Envoyer un email de notification à l'admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Nouvelle demande d\'inscription résident',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #06B6D4;">Nouvelle demande d'inscription</h2>
                    <p>Une nouvelle demande d'inscription résident a été reçue :</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Nom :</strong> ${firstName} ${lastName}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Email :</strong> ${email}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Téléphone :</strong> ${phone}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Appartement :</strong> ${tempApartmentDetails}</p>
                        <p style="margin: 5px 0 0 0;"><strong>User ID :</strong> ${userId}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                    </div>

                    <p>Connectez-vous à l'interface d'administration pour valider ou rejeter cette demande.</p>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/residents" 
                       style="display: inline-block; background-color: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
                        Voir les demandes en attente
                    </a>
                </div>
            `
        };

        // Envoyer les emails
        try {
            await transporter.sendMail(residentMailOptions);
            await transporter.sendMail(adminMailOptions);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Inscription réussie. Votre compte est en attente de validation.",
        });

    } catch (error: any) {
        console.error('Error in registration:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
