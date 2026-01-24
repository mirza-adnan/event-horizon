import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `http://localhost:5050/api/users/verify-email?token=${token}`;

    const mailOptions = {
        from: '"Event Horizon" <no-reply@eventhorizon.com>',
        to: email,
        subject: "Verify Your Email Address",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #CCFB51;">Welcome to Event Horizon!</h2>
                <p>Please verify your email address to complete your registration.</p>
                <div style="margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #CCFB51; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p>or click this link:</p>
                <p><a href="${verificationLink}">${verificationLink}</a></p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw logic error, maybe just log it. 
        // In prod, you might want to retry or fail the signup.
        // For now, we proceed.
    }
};
