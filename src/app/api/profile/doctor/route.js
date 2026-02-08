import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

import { getDataFromToken } from "@/helper/getDataFromToken";

import User from "@/models/user";


export async function GET(req) {
await connectDB();


    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const id = searchParams.get("id");

    try {
        let doctor;

        if (doctorId) {
            doctor = await User.findOne({ "doctorProfile.doctorId": doctorId, role: "doctor" }).select("-password");
        } else if (id) {
            doctor = await User.findOne({ _id: id, role: "doctor" }).select("-password");
        } else {
            return NextResponse.json({ error: "doctorId or id is required" }, { status: 400 });
        }

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, doctor }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


