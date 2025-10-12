"use client"

import { useState } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ChatButton({ roomId, disabled = false }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const joinChat = async () => {
        try {
            setLoading(true)


            // Navigate to consultation room (chat mode)
            router.push(`/consultation/${roomId}?mode=chat`)
            toast.success("Joining chat room")
        } catch (error) {
            console.error("Error joining chat:", error)
            toast.error("Failed to join chat. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={joinChat}
            disabled={disabled || loading}
            variant="outline"
            size="sm"
            className="bg-transparent text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto min-w-0"
        >
            {loading ? (
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
            ) : (
                <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            )}
            <span className="hidden sm:inline">{loading ? "Joining..." : "Join Chat"}</span>
            <span className="sm:hidden">{loading ? "..." : "Chat"}</span>
        </Button>
    )
}