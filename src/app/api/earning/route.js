import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function GET(req) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connect();

        // ✅ Only count completed + paid appointments
        const appointments = await Appointment.find({
            doctorId: userId,
            paymentStatus: "paid"
        });

        // ✅ Calculate total earnings
        const totalEarnings = appointments.reduce(
            (acc, curr) => acc + (curr.consultationFee || 0),
            0
        );

        // ✅ Group earnings by month
        const earningsByMonth = {};
        appointments.forEach((appt) => {
            const month = appt.createdAt.getMonth() + 1; // 1–12
            const year = appt.createdAt.getFullYear();
            const key = `${year}-${month}`; // e.g. "2025-8"
            earningsByMonth[key] =
                (earningsByMonth[key] || 0) + (appt.consultationFee || 0);
        });

        return NextResponse.json({
            success: true,
            totalEarnings,
            earningsByMonth,
        });
    } catch (error) {
        console.error("❌ Error in earnings route:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
