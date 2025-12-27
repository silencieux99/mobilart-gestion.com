import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin/config';
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
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        if (!adminAuth || !adminDb) {
            return NextResponse.json(
                { error: 'Firebase Admin not initialized' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { residentId, action } = body; // action: 'approve' or 'reject'

        if (!residentId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Récupérer les données du résident
        const residentDoc = await adminDb.collection('users').doc(residentId).get();
        
        if (!residentDoc.exists) {
            return NextResponse.json(
                { error: 'Résident non trouvé' },
                { status: 404 }
            );
        }

        const residentData = residentDoc.data();

        if (action === 'approve') {
            // Activer le compte Firebase Auth
            await adminAuth.updateUser(residentId, {
                disabled: false,
            });

            // Mettre à jour le statut dans Firestore
            await adminDb.collection('users').doc(residentId).update({
                status: 'approved',
                isActive: true,
                validatedAt: new Date(),
                validatedBy: 'admin', // TODO: Get from current user
            });

            // Envoyer un email de confirmation
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: residentData?.email,
                subject: 'Votre compte a été validé - Mobilart Gestion',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #06B6D4;">Compte validé !</h2>
                        <p>Bonjour ${residentData?.firstName} ${residentData?.lastName},</p>
                        <p>Bonne nouvelle ! Votre compte résident a été validé par notre équipe administrative.</p>
                        
                        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold;">Vous pouvez maintenant vous connecter :</p>
                            <p style="margin: 10px 0 0 0;">Email : <strong>${residentData?.email}</strong></p>
                            <p style="margin: 5px 0 0 0;">Utilisez le mot de passe que vous avez choisi lors de l'inscription.</p>
                        </div>

                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                           style="display: inline-block; background-color: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
                            Accéder à mon espace
                        </a>
                        
                        <p style="margin-top: 30px; font-size: 12px; color: #6B7280;">
                            Bienvenue dans votre espace résident Mobilart !
                        </p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

            return NextResponse.json({ 
                success: true, 
                message: "Résident validé avec succès"
            });

        } else if (action === 'reject') {
            // Supprimer le compte Firebase Auth
            await adminAuth.deleteUser(residentId);

            // Supprimer le document Firestore
            await adminDb.collection('users').doc(residentId).delete();

            // Envoyer un email de notification
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: residentData?.email,
                subject: 'Demande d\'inscription - Mobilart Gestion',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #EF4444;">Demande d'inscription</h2>
                        <p>Bonjour ${residentData?.firstName} ${residentData?.lastName},</p>
                        <p>Nous vous remercions pour votre demande d'inscription à l'espace résident Mobilart.</p>
                        
                        <p>Malheureusement, nous n'avons pas pu valider votre demande. Les informations fournies ne correspondent pas à nos enregistrements.</p>
                        
                        <p>Si vous pensez qu'il s'agit d'une erreur, nous vous invitons à contacter directement le syndic :</p>
                        
                        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Email :</strong> contact@mobilart-gestion.com</p>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 12px; color: #6B7280;">
                            Cordialement,<br>
                            L'équipe Mobilart Gestion
                        </p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

            return NextResponse.json({ 
                success: true, 
                message: "Demande rejetée"
            });

        } else {
            return NextResponse.json(
                { error: 'Action invalide' },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error('Error validating resident:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
