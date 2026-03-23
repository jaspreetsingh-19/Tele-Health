"use client"

import { useState } from "react"
import { Upload, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { toast } from "sonner"

export default function FileUpload({ onFileUploaded, roomId, disabled }) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const uploadFile = async (file) => {
        if (!file) return

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB")
            return
        }

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]

        if (!allowedTypes.includes(file.type)) {
            toast.error("File type not supported. Please upload PDF, images, or documents.")
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("roomId", roomId)

            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
                    setUploadProgress(progress)
                },
            })

            if (response.data.success) {
                onFileUploaded(response.data.file)
                toast.success(`${file.name} uploaded successfully!`)
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast.error(error.response?.data?.message || "Failed to upload file. Please try again.")
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    if (uploading) {
        return (
            <div className="w-32">
                <Card>
                    <CardContent className="p-2">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Uploading...</span>
                                <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-1.5" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        // FIX: use label wrapping input — this always opens file picker on click
        // no ref.click() needed, no async context issues
        <label
            className={`cursor-pointer flex-shrink-0 ${disabled ? "pointer-events-none opacity-50" : ""}`}
            title="Upload file (PDF, image, doc — max 10MB)"
        >
            <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
                disabled={disabled || uploading}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file)
                    // reset so same file can be re-uploaded
                    e.target.value = ""
                }}
            />
            <div className={`inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Upload className="h-4 w-4" />
            </div>
        </label>
    )
}