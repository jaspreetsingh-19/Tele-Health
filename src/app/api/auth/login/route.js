import connectDB from "@/lib/db"
import { NextResponse } from "next/server"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export async function POST(request) {
    await connectDB();

    try {
        const reqBody = await request.json()
        const { email, password, doctorId } = reqBody
        let existingUser

        if (doctorId) {
            existingUser = await User.findOne({ "doctorProfile.doctorId": doctorId })
            if (!existingUser) {
                return NextResponse.json({ error: "Doctor not found" }, { status: 400 })
            }

            // Role check
            if (existingUser.role !== "doctor") {
                return NextResponse.json({ error: "Not a doctor account" }, { status: 403 })
            }
        } else {
            existingUser = await User.findOne({ email })
            if (!existingUser) {
                return NextResponse.json({ error: "User not found" }, { status: 400 })
            }
        }

        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 })
        }

        const tokenData = {
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
        }

        existingUser.lastLogin = new Date()
        await existingUser.save()

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "7d" })

        const profileCompleted =
            existingUser.role === "patient"
                ? existingUser.patientProfile?.isProfileComplete
                : existingUser.role === "doctor"
                    ? existingUser.doctorProfile?.isProfileComplete
                    : false

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            role: existingUser.role,
            profileCompleted: !!profileCompleted,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
                doctorProfile: existingUser.doctorProfile,
                patientProfile: existingUser.patientProfile,
            },
        })
        response.cookies.set("token", token, { httpOnly: true })
        return response
    } catch (error) {
        console.log("error in api/login ", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
