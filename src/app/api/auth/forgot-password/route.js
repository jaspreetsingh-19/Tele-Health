import { NextResponse } from "next/server";
import User from "@/models/user"
import crypto from "crypto";
import connect from "@/lib/db";
import { sendPasswordResetEmail } from "@/helper/mailtrap.config";

connect();

export async function POST(request) {
    const reqBody = await request.json();
    const { email } = reqBody;

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.forgotPasswordToken = resetToken;
        user.forgotPasswordTokenExpiry = resetTokenExpiry;

        const updatedUser = await user.save();
        console.log("Saved reset token:", updatedUser.forgotPasswordToken);


        await sendPasswordResetEmail(user.email, `${process.env.DOMAIN}/auth/reset-password/${resetToken}`);

        return NextResponse.json({ message: "Password reset email sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error during email verification:", error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}