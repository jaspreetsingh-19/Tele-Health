import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/models/user";
import { getDataFromToken } from "@/helper/getDataFromToken";



connect();


function generatePatientId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `PAT${randomNum}`;
}

export async function GET(request) {

    const userId = await getDataFromToken(request)
    if (!userId) { return NextResponse.json({ error: "User not found" }, { status: 404 }); }

    try {
        const user = await User.findById(userId).select("-password");
        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.log("error in profile-patient", error)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }

}


export async function PATCH(request) {

    const { fullname, dob, gender, phone, address, medicalHistory } = await request.json();
    const userId = await getDataFromToken(request);
    console.log("user id", userId)

    try {
        const user = await User.findById(userId);
        console.log("user", user)
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });


        const profile = user.patientProfile || {};


        profile.fullName = fullname;
        profile.dob = dob;
        profile.gender = gender;
        profile.phone = phone;
        profile.address = address;
        profile.medicalHistory = medicalHistory;

        if (!profile.patientId) {
            profile.patientId = generatePatientId();
        }

        profile.isProfileComplete = true
        user.patientProfile = profile;

        await user.save();

        return NextResponse.json({ success: true, user });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}