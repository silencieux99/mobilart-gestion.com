import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin/config';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
// NOTE: For Gmail, use an App Password. For general SMTP, use standard details.
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'contact@mobilart-gestion.com',
        pass: process.env.EMAIL_PASS // Mot de passe défini dans .env
    }
});

function generatePassword(length = 10) {
    const charset = "top_secret_code_!@#$"; // Simplified charset for readable randomness or standarize
    const standardCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let retVal = "";
    for (let i = 0, n = standardCharset.length; i < length; ++i) {
        retVal += standardCharset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, role, tempApartmentDetails } = body;

        // 1. Generate Password
        const password = generatePassword(12);

        // 2. Create User in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            emailVerified: false,
            password: password,
            displayName: `${firstName} ${lastName}`,
            disabled: false,
        });

        // 3. Create User Document in Firestore
        // We match the ID from Auth
        await adminDb.collection('users').doc(userRecord.uid).set({
            firstName,
            lastName,
            email,
            phone,
            role,
            tempApartmentDetails,
            createdAt: new Date(), // serverTimestamp equivalent in Admin SDK
            isActive: true, // Auto-activate
            notificationPreferences: {
                email: true,
                sms: false,
                push: true
            },
            newsletterSubscribed: false
        });

        // 4. Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Bienvenue sur votre Espace Résident Mobilart',
            html: `
                <div style="font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Bienvenue à la Résidence Mobilart</h2>
                    <p>Bonjour ${firstName} ${lastName},</p>
                    <p>Votre compte résident a été créé avec succès. Vous pouvez désormais accéder à votre espace personnel pour suivre vos paiements, signaler des incidents et communiquer avec le syndic.</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Vos identifiants de connexion :</p>
                        <p style="margin: 10px 0 0 0;">Email : <strong>${email}</strong></p>
                        <p style="margin: 5px 0 0 0;">Mot de passe : <strong>${password}</strong></p>
                    </div>

                    <p>Nous vous conseillons de modifier ce mot de passe lors de votre première connexion.</p>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon espace</a>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #6B7280;">Ceci est un message automatique, merci de ne pas y répondre directement.</p>
                </div>
            `
        };

        // Don't block response on email sending if it fails, but good to know
        // For production, maybe queue it. Here await.
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // We still return success as user is created, but maybe warn
            return NextResponse.json({
                success: true,
                message: "User created but email failed to send",
                warning: "Email failed",
                userId: userRecord.uid
            });
        }

        return NextResponse.json({ success: true, message: "User created and email sent", userId: userRecord.uid });

    } catch (error: any) {
        console.error('Error creating resident:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
