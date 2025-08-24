import connect from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmailSuccess } from "@/helper/mailtrap.config";

export async function POST(request, { params }) {
    await connect();


    try {
        console.log("started")
        const { token } = await params;
        console.log("token", token)
        const reqBody = await request.json();
        const { password } = reqBody;
        console.log("password", password)

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }
        console.log("Searching for user with token:", token);
        const user = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            console.log("No user found with valid token or token expired");
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save();

        await sendPasswordResetEmailSuccess(user.email);

        return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
