"use client"

import { Download, FileText, ImageIcon, File, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function FileMessage({
    fileUrl,
    fileName,
    fileSize,
    fileType,
    messageType,
    isMyMessage,
}) {
    console.log("[v0] FileMessage props:", {
        fileUrl,
        fileName,
        fileSize,
        fileType,
        messageType,
        isMyMessage,
    })

    if (!fileUrl) {
        // console.error("[v0] FileMessage: fileUrl is undefined or empty")
        return (
            <Card className={`max-w-xs sm:max-w-sm ${isMyMessage ? "bg-primary/10" : "bg-muted"}`}>
                <CardContent className="p-2 md:p-3">
                    <div className="flex items-center gap-2 md:gap-3">
                        <File className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs md:text-sm text-muted-foreground truncate">
                                {fileName || "Unknown file"}
                            </div>
                            <div className="text-xs text-red-500">File URL not available</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getFileIcon = () => {
        if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
        if (fileType === "application/pdf") return <FileText className="h-4 w-4 md:h-5 md:w-5" />
        return <File className="h-4 w-4 md:h-5 md:w-5" />
    }

    const handleDownload = async () => {
        try {
            console.log("[v0] Starting download:", { fileName, fileUrl })


            if (!fileUrl) {
                console.error("[v0] Cannot download: fileUrl is undefined")
                toast.error("File URL is not available. Please try again.")
                return
            }

            console.log("[v0] Attempting direct download from Cloudinary")
            try {
                const response = await fetch(fileUrl, { method: "HEAD" })
                if (response.ok) {
                    // File is accessible, download directly
                    const link = document.createElement("a")
                    link.href = fileUrl
                    link.download = fileName
                    link.target = "_blank"
                    link.rel = "noopener noreferrer"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    console.log("[v0] Direct download initiated successfully")
                    toast.success("Download started successfully")
                    return
                }
            } catch (directError) {
                console.warn("[v0] Direct download failed, trying proxy:", directError)
            }

            // Fallback to proxy download
            const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`
            console.log("[v0] Trying proxy download URL:", downloadUrl)

            try {
                const response = await fetch(downloadUrl)
                if (response.ok) {
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = fileName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    console.log("[v0] Proxy download successful")
                    toast.success("File downloaded successfully")
                    return
                }
            } catch (proxyError) {
                console.warn("[v0] Proxy download also failed:", proxyError)
            }

            console.log("[v0] All download methods failed, opening in new tab")
            window.open(fileUrl, "_blank", "noopener,noreferrer")
            toast.info("File opened in new tab")
        } catch (error) {
            console.error("[v0] All download methods failed:", error)
            toast.error("Failed to download file. The file URL may be inaccessible.")
        }
    }

    const handlePreview = () => {
        try {
            console.log("[v0] Opening preview:", { fileName, fileUrl })

            if (!fileUrl) {
                console.error("[v0] Cannot preview: fileUrl is undefined")
                toast.error("File URL is not available. Please try downloading instead.")
                return
            }

            toast.info("Opening file preview...")

            // For PDFs and images, open directly in new tab
            const newWindow = window.open(fileUrl, "_blank", "noopener,noreferrer")
            if (!newWindow) {
                console.warn("[v0] Popup blocked, trying alternative method")
                // Fallback if popup is blocked
                const link = document.createElement("a")
                link.href = fileUrl
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.warning("Popup blocked - file opened in background tab")
            } else {
                toast.success("File preview opened")
            }
        } catch (error) {
            console.error("[v0] Preview failed:", error)
            toast.error("Failed to preview file. Please try downloading instead.")
        }
    }

    if (messageType === "image" && fileType.startsWith("image/")) {
        return (
            <div className="max-w-xs sm:max-w-sm">
                <div className="relative group">
                    <img
                        src={fileUrl || "/placeholder.svg"}
                        alt={fileName}
                        className="rounded-lg max-w-full h-auto cursor-pointer transition-opacity hover:opacity-90"
                        onClick={handlePreview}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button variant="secondary" size="sm" onClick={handlePreview} className="text-xs md:text-sm">
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            View
                        </Button>
                    </div>
                </div>
                <div className="mt-1 md:mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate flex-1 min-w-0" title={fileName}>
                        {fileName}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="h-6 w-6 p-0 flex-shrink-0"
                        title="Download file"
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Card className={`max-w-xs sm:max-w-sm ${isMyMessage ? "bg-primary/10" : "bg-muted"}`}>
            <CardContent className="p-2 md:p-3">
                <div className="flex items-start gap-2 md:gap-3">
                    <div className="flex-shrink-0 mt-0.5 md:mt-1">{getFileIcon()}</div>

                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs md:text-sm truncate" title={fileName}>
                            {fileName}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs h-5">
                                {formatFileSize(fileSize)}
                            </Badge>
                            <Badge variant="outline" className="text-xs h-5">
                                {fileType.split("/")[1]?.toUpperCase() || "FILE"}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                        {fileType === "application/pdf" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreview}
                                className="h-6 w-6 md:h-8 md:w-8 p-0"
                                title="Preview PDF"
                            >
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="h-6 w-6 md:h-8 md:w-8 p-0"
                            title="Download file"
                        >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}