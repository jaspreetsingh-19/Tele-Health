import { NextResponse } from "next/server"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function GET(req) {
    try {
        const userId = await getDataFromToken(req)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const fileUrl = searchParams.get("url")
        const fileName = searchParams.get("name")

        if (!fileUrl || !fileName) {
            return NextResponse.json({ error: "File URL and name are required" }, { status: 400 })
        }

        console.log("[v0] Downloading file:", { fileUrl, fileName })

        const response = await fetch(fileUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; ChatApp/1.0)",
            },
        })

        if (!response.ok) {
            console.error("[v0] Failed to fetch file from Cloudinary:", {
                status: response.status,
                statusText: response.statusText,
                url: fileUrl,
            })

            if (!response.ok) {
                console.error("Cloudinary fetch failed", response.status, response.statusText)
                return NextResponse.json(
                    { error: `Failed to fetch file from Cloudinary: ${response.statusText}` },
                    { status: response.status }
                )
            }

            return NextResponse.json(
                {
                    error: `Failed to fetch file: ${response.status} ${response.statusText}`,
                },
                { status: 500 },
            )
        }

        const fileBuffer = await response.arrayBuffer()
        const contentType = response.headers.get("content-type") || "application/octet-stream"

        console.log("[v0] File fetched successfully:", {
            size: fileBuffer.byteLength,
            contentType,
            fileName,
        })

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                "Content-Length": fileBuffer.byteLength.toString(),
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        })
    } catch (error) {
        console.error("[v0] File download error:", error)
        return NextResponse.json({ error: "File download failed" }, { status: 500 })
    }
}
