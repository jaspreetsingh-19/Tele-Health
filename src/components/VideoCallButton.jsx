"use client"
import { useState } from "react"
import { Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function VideoCallButton({ roomId, disabled = false }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const joinVideoCall = async () => {
        try {
            setLoading(true)
            toast.loading("Preparing to join video call...", { id: "video-call" })

            // Check if browser supports WebRTC
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Your browser doesn't support video calls. Please use a modern browser.", {
                    id: "video-call",
                    description: "Browser not supported"
                })
                return
            }

            // Request camera and microphone permissions
            try {
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                toast.success("Camera and microphone access granted", { id: "video-call" })
            } catch (error) {
                toast.error("Please allow camera and microphone access to join the video call.", {
                    id: "video-call",
                    description: "Permission denied"
                })
                return
            }

            // Navigate to consultation room
            toast.success("Joining video call...", { id: "video-call" })
            router.push(`/consultation/${roomId}`)
        } catch (error) {
            console.error("Error joining video call:", error)
            toast.error("Failed to join video call", {
                id: "video-call",
                description: "Please try again or contact support"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={joinVideoCall}
            disabled={disabled || loading}
            className="bg-primary hover:bg-primary/90"
            size="sm"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
            {loading ? "Joining..." : "Join Video Call"}
        </Button>
    )
}