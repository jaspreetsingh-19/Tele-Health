import nodemailer from "nodemailer";
import { mailTemplate, ResetPasswordTemplate, ResetPasswordSuccessTemplate } from "@/lib/mailTemplate";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sender = {
    email: process.env.GMAIL_USER,
    name: "Student Buddy",
};

export default async function sendVerificationEmail(email, verificationToken) {
    try {
        const html = mailTemplate
            .replace("{username}", email)
            .replace("{verificationCode}", verificationToken);

        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Verify Your Email",
            html,
        });

        console.log("Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
}

export async function sendWelcomeEmail(email, username) {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to Student Buddy!",
            html: `<h1>Welcome ${username}!</h1><p>Thanks for joining Student Buddy. We're glad to have you!</p>`,
        });

        console.log("Welcome email sent successfully:", response);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
}

export async function sendPasswordResetEmail(email, resetUrl) {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Reset Your Password",
            html: ResetPasswordTemplate.replace("{resetLink}", resetUrl),
        });

        console.log("Password reset email sent successfully:", response);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}

export async function sendPasswordResetEmailSuccess(email) {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Password Reset Successful",
            html: ResetPasswordSuccessTemplate,
        });

        console.log("Password reset success email sent:", response);
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error("Failed to send password reset success email");
    }
}
