"use client"

import { useState } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ChatButton({ roomId, disabled = false }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const joinChat = async () => {
        try {
            setLoading(true)
            // Navigate to consultation room (chat mode)
            router.push(`/consultation/${roomId}?mode=chat`)
        } catch (error) {
            console.error("Error joining chat:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={joinChat} disabled={disabled || loading} variant="outline" size="sm" className="bg-transparent">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
            {loading ? "Joining..." : "Join Chat"}
        </Button>
    )
}
