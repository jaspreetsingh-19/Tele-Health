// /app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const roomId = formData.get("roomId");
        const userId = formData.get("userId");

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        // Decide Cloudinary resource type
        const fileType = file.type;
        const isDoc =
            fileType === "application/pdf" ||
            fileType === "application/msword" ||
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            fileType.startsWith("text/");
        const resourceType = isDoc ? "raw" : "auto";

        // Convert File → Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: "chat-files",
                    public_id: `room_${roomId}_${userId}_${Date.now()}`,
                    overwrite: true,
                    invalidate: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            file: {
                url: uploadResponse.secure_url,
                publicId: uploadResponse.public_id,
                originalName: file.name,
                size: file.size,
                type: fileType,
                resourceType: uploadResponse.resource_type, // image OR raw
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}
