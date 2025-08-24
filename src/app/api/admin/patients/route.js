import { NextResponse } from "next/server"
import User from "@/models/user"
import connect from "@/lib/db";


connect();

export async function GET(request) {


    try {
        const patients = await User.find({ role: "patient" })
            .select("-password");

        return NextResponse.json(patients);

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });

    }
}


export async function DELETE(request) {

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



