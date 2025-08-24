import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs";

import { getDataFromToken } from "@/helper/getDataFromToken"


export async function POST(request) {
    const userId = await getDataFromToken(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        // Check if GEMINI_API_KEY is available
        if (!process.env.GOOGLE_AI_API_KEY) {
            return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
        }

        // Get the uploaded file from FormData
        const formData = await request.formData()
        const file = formData.get("file")

        if (!file) {
            return Response.json({ error: "No file uploaded" }, { status: 400 })
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return Response.json({ error: "Only PDF files are supported" }, { status: 400 })
        }

        // Convert file to buffer for processing
        const fileBuffer = await file.arrayBuffer()
        const base64Data = Buffer.from(fileBuffer).toString("base64")

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Create the prompt for medical report analysis
        const prompt = `
You are a medical report analyzer. Review the provided medical report PDF and generate a detailed and structured analysis.

Instructions for formatting:
- Output must be plain text only.
- Use only numbers for section headings (1, 2, 3...) and for sub-points use bullet points.
- Keep some indentaion between points and subpoints. 
- Do not use any bold, italics, markdown syntax, or special symbols such as *, #, -, or underscores.
- No extra blank lines between headings unless needed for readability.

Present the output in numbered sections as follows:
1. Summary - Provide a concise overview of the report.
2. Key Findings - List the important medical observations and results.
3. Test Results - Present laboratory values, imaging outcomes, or any other diagnostic results, including units where applicable.
4. Recommendations - State any medical advice, follow-up steps, or lifestyle changes suggested by the report.
5. Risk Factors - Identify potential health risks or conditions indicated by the report.
6. Normal vs Abnormal - Clearly distinguish between results within normal ranges and those outside normal ranges, with brief explanations.

Ensure the explanation is easy to understand, logically organized, and free of medical jargon unless necessary, in which case include a short definition.
`;

        // Analyze the PDF with Gemini
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf",
                },
            },
        ])

        const analysis = result.response.text()

        await Log.create({
            userId,
            action: "Analyzed Reports",
            details: `Input: Analyzed there reports`,
            feature: "Report Ananlyzer",
            timestamp: new Date(),
        });

        return Response.json({
            success: true,
            analysis: analysis,
            fileName: file.name,
            fileSize: file.size,
        })
    } catch (error) {
        console.error("Error analyzing report:", error)

        // Handle specific Gemini API errors
        if (error.message?.includes("API key")) {
            return Response.json(
                { error: "Invalid or missing API key. Please check your GEMINI_API_KEY configuration." },
                { status: 500 },
            )
        }

        if (error.message?.includes("quota")) {
            return Response.json({ error: "API quota exceeded. Please try again later." }, { status: 429 })
        }

        return Response.json({ error: "Failed to analyze report. Please try again." }, { status: 500 })
    }
}
