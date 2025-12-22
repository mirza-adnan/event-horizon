require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASS,
    },
});

const sendConfirmationEmail = (
    name: string,
    email: string,
    confirmationCode: string
) => {
    transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: email,
        subject: "Organizer email verification",
        html: `<h1>Email Confirmation</h1>
    <h2>Hello ${name}</h2>
    <p>Thank you for joining Event Horizon as an organizer. Please confirm your email by clicking on the following link</p>
    <a href="http://localhost:5050/api/organizers/verify/${confirmationCode}" target="_blank"> Click here</a>
    </div>`,
    });
};

export default sendConfirmationEmail;
