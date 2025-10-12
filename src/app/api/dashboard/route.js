import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/models/user";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

export async function GET(request) {
    const userId = await getDataFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return profile based on user role
        let profileData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            authProvider: user.authProvider
        };

        if (user.role === "patient" && user.patientProfile) {
            profileData.profile = user.patientProfile;
        } else if (user.role === "doctor" && user.doctorProfile) {
            profileData.profile = user.doctorProfile;
        } else {
            profileData.profile = null;
        }

        return NextResponse.json({ success: true, user: profileData });

    } catch (error) {
        console.log("error in profile route", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {

    const userId = await getDataFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const body = await request.json();
        console.log("Received update data:", body); // Debug log

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let updatedUser;

        // Update profile based on user role
        if (user.role === "patient") {
            // Handle case where patientProfile might be null/undefined
            const currentPatientProfile = user.patientProfile || {};

            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    patientProfile: { ...currentPatientProfile, ...body.profile },
                    avatar: body.avatar || user.avatar
                },
                { new: true }
            ).select("-password");

        } else if (user.role === "doctor") {
            // Handle case where doctorProfile might be null/undefined
            const currentDoctorProfile = user.doctorProfile || {};

            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    doctorProfile: { ...currentDoctorProfile, ...body.profile },
                    avatar: body.avatar || user.avatar
                },
                { new: true }
            ).select("-password");

        } else {
            return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
        }

        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
        }

        // Format the response to match the GET route structure
        let responseData = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            isVerified: updatedUser.isVerified,
            lastLogin: updatedUser.lastLogin,
            authProvider: updatedUser.authProvider
        };

        // Add the appropriate profile data
        if (updatedUser.role === "patient" && updatedUser.patientProfile) {
            responseData.profile = updatedUser.patientProfile;
        } else if (updatedUser.role === "doctor" && updatedUser.doctorProfile) {
            responseData.profile = updatedUser.doctorProfile;
        } else {
            responseData.profile = null;
        }

        return NextResponse.json({ success: true, user: responseData });

    } catch (error) {
        console.log("error in profile update", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}