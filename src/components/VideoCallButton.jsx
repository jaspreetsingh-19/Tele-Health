"use client"

import { useState } from "react"
import { Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function VideoCallButton({ roomId, disabled = false }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const joinVideoCall = async () => {
        try {
            setLoading(true)

            // Check if browser supports WebRTC
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                // toast({
                //     title: "Browser not supported",
                //     description: "Your browser doesn't support video calls. Please use a modern browser.",
                //     variant: "destructive",
                // })
                return
            }

            // Request camera and microphone permissions
            try {
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            } catch (error) {
                // toast({
                //     title: "Permission denied",
                //     description: "Please allow camera and microphone access to join the video call.",
                //     variant: "destructive",
                // })
                return
            }

            // Navigate to consultation room
            router.push(`/consultation/${roomId}`)
        } catch (error) {
            console.error("Error joining video call:", error)
            // toast({
            //     title: "Error",
            //     description: "Failed to join video call",
            //     variant: "destructive",
            // })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={joinVideoCall} disabled={disabled || loading} className="bg-primary hover:bg-primary/90" size="sm">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
            {loading ? "Joining..." : "Join Video Call"}
        </Button>
    )
}
