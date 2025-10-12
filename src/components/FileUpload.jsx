"use client"

import { useState, useRef } from "react"
import { Upload, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { toast } from "sonner"

export default function FileUpload({ onFileUploaded, roomId, disabled }) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileSelect = (files) => {
        if (!files || files.length === 0) return
        uploadFile(files[0])
    }

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
                headers: {
                    "Content-Type": "multipart/form-data",
                },
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
            const errorMessage = error.response?.data?.message || "Failed to upload file. Please try again."
            toast.error(errorMessage)
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            toast.info(`Dropped ${file.name}`)
            handleFileSelect(e.dataTransfer.files)
        }
    }

    const getFileIcon = (fileType) => {
        if (fileType.startsWith("image/")) return <ImageIcon className="h-3 w-3 md:h-4 md:w-4" />
        if (fileType === "application/pdf") return <FileText className="h-3 w-3 md:h-4 md:w-4" />
        return <File className="h-3 w-3 md:h-4 md:w-4" />
    }

    if (uploading) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm">
                <Card className="w-full">
                    <CardContent className="p-3 md:p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm font-medium truncate mr-2">Uploading...</span>
                                <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <Progress value={uploadProgress} className="w-full h-1.5 md:h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
                disabled={disabled}
            />

            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    console.log("[v0] File upload button clicked")
                    if (fileInputRef.current) {
                        fileInputRef.current.click()
                        console.log("[v0] File input triggered")
                    } else {
                        console.log("[v0] File input ref not available")
                    }
                }}
                disabled={disabled || uploading}
                className="flex-shrink-0 p-2 md:p-2.5"
                title="Upload file"
            >
                <Upload className="h-4 w-4" />
            </Button>

            {/* Drag and drop overlay - Desktop only for better UX */}
            <div
                className={`absolute inset-0 border-2 border-dashed rounded-md transition-colors hidden md:block ${dragActive ? "border-primary bg-primary/10" : "border-transparent"
                    } ${disabled ? "pointer-events-none" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {dragActive && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-2">
                            <Upload className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 text-primary" />
                            <p className="text-xs md:text-sm font-medium">Drop file here</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile-specific drag hint (hidden by default, shown on first drag attempt) */}
            <div className="md:hidden">
                {dragActive && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center">
                        <div className="text-center p-2">
                            <Upload className="h-6 w-6 mx-auto mb-1 text-primary" />
                            <p className="text-xs font-medium">Tap to upload instead</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}