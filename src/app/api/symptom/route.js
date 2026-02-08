import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Symptom from "@/models/Symptom";
import Log from "@/models/logs";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataFromToken } from "@/helper/getDataFromToken"





export async function POST(request) {
    await connectDB();

    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { inputText } = await request.json();
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const prompt = `You are a certified virtual medical assistant.

Your job:
Analyze the symptoms provided by the user and return a simple, human-readable text output.
Do NOT use JSON or any special symbols such as *, -, or •.
Instead, use simple numbering (1., 2., 3.) for lists.

Required Output Format:
1. Start with the heading "Possible conditions:" on its own line.
   - List at least 2 possible conditions, each numbered and followed by a short reason in plain language.
2. Then, on a new line, write the heading "Urgency level:" and state the urgency (e.g., Non-Urgent, Urgent, Emergency).
3. Then, on a new line, write the heading "Next steps:".
   - Provide at least 3 numbered recommendations, in simple and empathetic language.

Rules:
- Be empathetic, reassuring, and clear.
- If symptoms could be life-threatening, strongly advise immediate medical attention.
- If symptoms are insufficient, respond with: "Please provide more details about your symptoms."
- Keep the language non-technical and easy for anyone to understand.
- Do not include extra explanations or unrelated content.

Now, analyze the following symptoms:

Symptoms: ${inputText}
`;


        const result = await model.generateContent(prompt)
        const generated = await result.response.text()

        const symptom = await Symptom.create({
            patient: userId,
            inputText,
            aiResult: generated,
        })

        await Log.create({
            userId,
            action: "Checked For Symptoms",
            details: `Input: ${inputText.slice(0, 50)}...`,
            feature: "Symptoms",
            timestamp: new Date(),
        });
        return NextResponse.json({ symptom })
    } catch (error) {
        console.error("❌ Backend Error in POST /api/Symptom:", error);
        return NextResponse.json(
            { error: "Something went wrong", detail: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    await connectDB();

    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const symptoms = await Symptom.find({ patient: userId }).sort({ createdAt: -1 });


        return NextResponse.json({ symptoms });
    } catch (error) {

        console.error("❌ Backend Error in GET /api/symptoms:", error);
        return NextResponse.json(
            { error: "Failed to fetch roadmaps", detail: error.message },
            { status: 500 }
        );

    }

}