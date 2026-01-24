import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASS,
    },
});

export const sendOrganizerVerification = (
    name: string,
    email: string,
    confirmationCode: string
) => {
    transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Organizer Email Verification - Event Horizon",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #CCFB51;">Email Confirmation</h1>
                <h2>Hello ${name}</h2>
                <p>Thank you for joining Event Horizon as an organizer. Please confirm your email by clicking on the following link:</p>
                <div style="margin: 30px 0;">
                    <a href="http://localhost:5050/api/organizers/verify/${confirmationCode}" style="background-color: #CCFB51; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;" target="_blank">Verify Organizer Account</a>
                </div>
            </div>`,
    }).catch(err => console.error("Error sending organizer email:", err));
};

export const sendUserVerification = (
    name: string,
    email: string,
    confirmationCode: string
) => {
    transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: email,
        subject: "User Email Verification - Event Horizon",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #CCFB51;">Welcome to Event Horizon!</h1>
                <h2>Hello ${name}</h2>
                <p>Please verify your email address to start exploring events.</p>
                <div style="margin: 30px 0;">
                    <a href="http://localhost:5050/api/users/verify-email?token=${confirmationCode}" style="background-color: #CCFB51; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
            </div>`,
    }).catch(err => console.error("Error sending user email:", err));
};
