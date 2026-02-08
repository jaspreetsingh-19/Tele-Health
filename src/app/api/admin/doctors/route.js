import { NextResponse } from "next/server"
import User from "@/models/user"
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";




function generateDoctorId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `DOC${randomNum}`;
}

export async function GET(request) {
await connectDB();


    try {
        const doctor = await User.find({ role: "doctor" })
            .select("-password");

        return NextResponse.json(doctor);

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });

    }
}

export async function POST(request) {
    await connectDB();

    try {
        const body = await request.json();
        const {
            username,
            email,
            password,
            fullName,
            specialization,
            qualifications,
            experienceYears,
            consultationFee,
            availableDays,
            bio,
            photos,
            clinicAddress,
            licenseNumber
        } = body;

        // Basic validation
        if (!username || !email || !password || !fullName || !specialization) {
            return NextResponse.json(
                { error: "Required fields are missing" },
                { status: 400 }
            );
        }

        // Check for existing email/username
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return NextResponse.json(
                { error: "Doctor with this email or username already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create doctor
        const newDoctor = new User({
            username,
            email,
            password: hashedPassword,
            role: "doctor",
            doctorProfile: {
                doctorId: generateDoctorId(),
                fullName,
                docPhoto: photos,
                specialization, // array of strings
                qualifications,
                experienceYears,
                consultationFee,
                availableDays, // array of strings
                bio,

                clinicAddress,
                licenseNumber,
                isApproved: true // Admin created → directly approved
            }
        });

        await newDoctor.save();

        return NextResponse.json({
            message: "Doctor created successfully",
            doctor: newDoctor
        });
    } catch (error) {
        console.error("Error creating doctor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    await connectDB();


    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        return NextResponse.json({ message: "User deleted successfully", user: deletedUser, success: true }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });

    }
}



