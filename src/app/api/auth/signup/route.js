import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"
import bcrypt from "bcryptjs";

import sendVerificationEmail from "@/helper/mailtrap.config"




console.log("signup route called")

connect()

export async function POST(request) {

    try {
        const reqBody = await request.json()
        const { username, email, password } = reqBody

        const check = await User.findOne({ email })
        if (check) {
            return NextResponse.json({ error: "user already exist" }, { status: 400 })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit verification code
        console.log("verificationToken", verificationToken)

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000 // Token valid for 24 hours
        })
        const savedUser = await newUser.save()

        await sendVerificationEmail(savedUser.email, verificationToken)



        return NextResponse.json({ message: "user Created", success: true, savedUser })

    } catch (error) {
        console.error("Error during signup:", error);
        return NextResponse.json({ error: error }, { status: 500 })
    }



}
