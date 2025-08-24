import { MailtrapClient } from "mailtrap";
import { mailTemplate, ResetPasswordTemplate, ResetPasswordSuccessTemplate } from "@/lib/mailTemplate";

const TOKEN = process.env.MAILTRAP_TOKEN;

const client = new MailtrapClient({ token: TOKEN });

const sender = {
    email: "hello@demomailtrap.co",
    name: "student buddy",
};

export default async function sendVerificationEmail(email, verificationToken) {
    const recipient = [{ email }];
    try {
        const html = mailTemplate
            .replace("{username}", email)
            .replace("{verificationCode}", verificationToken);

        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email",
            html,
            category: "Email Verification",
        });

        console.log("Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}


export async function sendWelcomeEmail(email, username) {
    const recipient = [{ email }];
    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            template_uuid: "65377d38-11a0-4764-b1f7-902b39e416a8",
            template_variables: {
                "company_info_name": "Student Buddy",
                "name": username
            }

        })
        console.log("Welcome email sent successfully:", response);
    } catch (error) {
        console.error("Error sending welcome email:", error);

    }
}

export async function sendPasswordResetEmail(email, resetUrl) {

    const recipient = [{ email }];
    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Reset Your Password",
            html: ResetPasswordTemplate

                .replace("{resetLink}", resetUrl),
            category: "Password Reset",

        })
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");

    }
}

export async function sendPasswordResetEmailSuccess(email) {
    const recipient = [{ email }];
    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: ResetPasswordSuccessTemplate,
            category: "Password Reset Success",
        });
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error("Failed to send password reset success email");
    }

}
