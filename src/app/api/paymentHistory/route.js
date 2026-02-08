import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/Appointment";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function GET(req) {
    try {
        // 1️⃣ Get patient ID from token
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2️⃣ Connect to DB
        await connectDB();

        // 3️⃣ Fetch all appointments for this patient (paid, pending, failed, refunded)
        const appointments = await Appointment.find({
            patientId: userId,
        }).sort({ appointmentDate: -1 })
            .populate("doctorId", "username email doctorProfile"); // optional doctor info

        // 4️⃣ Calculate total spent (only sum paid appointments)
        const totalSpent = appointments.reduce(
            (acc, curr) => acc + (curr.paymentStatus === "paid" ? curr.consultationFee : 0),
            0
        );

        // 5️⃣ Group spending by month (only paid appointments)
        const spentByMonth = {};
        appointments.forEach((appt) => {
            if (appt.paymentStatus === "paid") {
                const month = appt.createdAt.getMonth() + 1; // 1–12
                const year = appt.createdAt.getFullYear();
                const key = `${year}-${month}`; // e.g. "2025-10"
                spentByMonth[key] = (spentByMonth[key] || 0) + (appt.consultationFee || 0);
            }
        });

        // 6️⃣ Return JSON
        return NextResponse.json({
            success: true,
            totalSpent,
            spentByMonth,
            appointments, // full list: patient can see paid, pending, failed, refunded
        });
    } catch (error) {
        console.error("❌ Error fetching patient payments:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
