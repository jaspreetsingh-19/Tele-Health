import { NextResponse } from "next/server";
import Log from "@/models/logs";
import User from "@/models/user";
import connect from "@/lib/db";

connect();

export async function GET(request) {

    try {

        const logs = await Log.find().sort({ timestamp: -1 }).limit(100);

        return NextResponse.json({ logs }, { success: true });
    } catch (error) {
        console.error("Failed to fetch logs", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId, action, feature, details } = await request.json();

        await Log.create({
            userId,
            feature,
            action,
            details,

            timestamp: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Log creation failed:", err);
        return NextResponse.json({ error: "Log creation failed" }, { status: 500 });
    }
}
