import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"
import { sendWelcomeEmail } from "@/helper/mailtrap.config";






connect()

export async function POST(request) {
    console.log("started")
    try {
        const reqBody = await request.json()
        const { code } = reqBody
        console.log("code", code)

        const savedUser = await User.findOne({ verificationToken: code, verificationTokenExpiry: { $gt: Date.now() } })
        console.log("saved", savedUser)
        if (!savedUser) {
            return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
        }


        savedUser.isVerified = true;
        savedUser.verificationToken = undefined
        savedUser.verificationTokenExpiry = undefined
        await savedUser.save()

        await sendWelcomeEmail(savedUser.email, savedUser.username)

        return NextResponse.json({ message: "Email verified successfully", success: true }, { status: 200 })

    } catch (error) {
        console.error("Error during email verification:", error);
        return NextResponse.json({ error: error }, { status: 500 })
    }



}
