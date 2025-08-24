
import connect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"
import { getDataFromToken } from "@/helper/getDataFromToken";

connect();

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request);
        const userData = await User.findOne({ _id: userId }).select("-password");

        return NextResponse.json({
            message: "User found",
            data: userData,
        });
    } catch (error) {
        console.error("ME ROUTE ERROR:", error);

        return NextResponse.json(
            {
                error: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
