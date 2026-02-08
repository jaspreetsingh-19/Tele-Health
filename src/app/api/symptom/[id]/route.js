import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Symptom from "@/models/Symptom";
import { getDataFromToken } from "@/helper/getDataFromToken";


export async function DELETE(request, context) {
    await connectDB();

    try {
        const { params } = context; // Extract params
        const userId = await getDataFromToken(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }



        const deletedSymptom = await Symptom.findOneAndDelete({ _id: params.id });

        if (!deletedSymptom) {
            return NextResponse.json({ error: "data not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("error in deleting", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
