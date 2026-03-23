"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import io from "socket.io-client"
import axios from "axios"
import { Send, ArrowLeft, Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import FileUpload from "@/components/FileUpload"
import FileMessage from "@/components/FileMessage"

const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("/api/auth/me")
                setUser(response.data.data || response.data.user || response.data)
                setError(null)
            } catch (err) {
                setError(err.response?.data?.message || "Authentication failed")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return { user, loading, error }
}

export default function PatientChatWithDoctor() {
    const { user, loading: authLoading, error: authError } = useAuth()
    const searchParams = useSearchParams()
    const router = useRouter()
    const appointmentId = searchParams.get("appointmentId")

    const [socket, setSocket] = useState(null)
    const [chatRoom, setChatRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [typing, setTyping] = useState(false)
    const [connected, setConnected] = useState(false)

    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const initializeChatRoom = async () => {
        try {
            setLoading(true)
            const response = await axios.post("/api/chat", { appointmentId })
            if (response.data.success) {
                setChatRoom(response.data.chatRoom)
                setMessages(response.data.chatRoom.messages || [])
            } else {
                toast.error("Failed to load chat room")
            }
        } catch (error) {
            toast.error("Failed to initialize chat. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user && appointmentId) initializeChatRoom()
    }, [user, appointmentId])

    useEffect(() => {
        if (!chatRoom || !user) return

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
            transports: ["websocket", "polling"],
        })

        newSocket.on("connect", () => {
            setConnected(true)
            newSocket.emit("join-room", {
                roomId: chatRoom.roomId,
                username: user.username || user.name,
                userId: user._id,
            })
        })

        newSocket.on("disconnect", () => setConnected(false))

        newSocket.on("receiveMessage", (messageData) => {
            setMessages((prev) => {
                if (messageData.senderId === (user._id || user.id)) return prev
                const exists = prev.some(
                    (msg) => msg.messageId === messageData.messageId ||
                        (msg.senderId === messageData.senderId &&
                            msg.message === messageData.content &&
                            Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 1000)
                )
                if (exists) return prev
                return [...prev, {
                    senderId: messageData.senderId,
                    senderType: messageData.senderRole === "doctor" ? "doctor" : "patient",
                    message: messageData.content,
                    messageType: messageData.type || "text",
                    timestamp: messageData.timestamp,
                    messageId: messageData.messageId,
                    fileData: messageData.fileData,
                }]
            })
        })

        newSocket.on("typing", (data) => {
            if (data.userId !== (user._id || user.id)) setTyping(data.isTyping)
        })

        newSocket.on("error", () => toast.error("Connection error"))
        newSocket.on("messageError", () => toast.error("Failed to send message"))

        setSocket(newSocket)
        return () => newSocket.disconnect()
    }, [chatRoom, user])

    const sendMessage = () => {
        if (!newMessage.trim() || !socket || !chatRoom || !user) return

        const optimisticMessage = {
            senderId: user._id || user.id,
            senderType: "patient",
            message: newMessage.trim(),
            messageType: "text",
            timestamp: new Date().toISOString(),
            messageId: `temp-${Date.now()}`,
        }

        setMessages((prev) => [...prev, optimisticMessage])
        socket.emit("sendMessage", {
            roomId: chatRoom.roomId,
            content: newMessage.trim(),
            sender: user.username || user.name,
            senderId: user._id || user.id,
            senderRole: "patient",
            type: "text",
        })
        setNewMessage("")
        socket.emit("typing", { roomId: chatRoom.roomId, userId: user._id || user.id, isTyping: false })
    }

    const handleFileUploaded = (fileData) => {
        if (!socket || !chatRoom || !user) return

        const optimisticFileMessage = {
            senderId: user._id || user.id,
            senderType: "patient",
            message: `Shared a file: ${fileData.originalName}`,
            messageType: fileData.type.startsWith("image/") ? "image" : "file",
            timestamp: new Date().toISOString(),
            messageId: `temp-file-${Date.now()}`,
            fileData: { url: fileData.url, name: fileData.originalName, size: fileData.size, type: fileData.type, publicId: fileData.publicId },
        }

        setMessages((prev) => [...prev, optimisticFileMessage])
        socket.emit("sendMessage", {
            roomId: chatRoom.roomId,
            content: `Shared a file: ${fileData.originalName}`,
            sender: user.username || user.name,
            senderId: user._id || user.id,
            senderRole: "patient",
            type: fileData.type.startsWith("image/") ? "image" : "file",
            fileData: { url: fileData.url, name: fileData.originalName, size: fileData.size, type: fileData.type, publicId: fileData.publicId },
        })
        toast.success("File sent")
    }

    const handleTyping = (value) => {
        setNewMessage(value)
        if (!socket || !chatRoom) return
        socket.emit("typing", { roomId: chatRoom.roomId, userId: user._id || user.id, isTyping: value.length > 0 })
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", { roomId: chatRoom.roomId, userId: user._id || user.id, isTyping: false })
        }, 1000)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    const isMyMessage = (msg) => msg.senderId === (user?._id || user?.id)

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg, i) => {
        const date = new Date(msg.timestamp).toDateString()
        const prev = messages[i - 1]
        const showDate = !prev || new Date(prev.timestamp).toDateString() !== date
        return [...groups, { ...msg, showDate, date }]
    }, [])

    if (authLoading || loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    )

    if (!user || authError) { router.push("/auth/login"); return null }
    if (!chatRoom) return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
                <p className="text-muted-foreground mb-4">Failed to load chat room</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        </div>
    )

    const doctorName = chatRoom.doctor?.doctorProfile?.fullName || chatRoom.doctor?.username || "Doctor"

    return (
        <div className="flex flex-col bg-background" style={{ height: "calc(100vh - 4rem)" }}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={chatRoom.doctor?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {doctorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">Dr. {doctorName}</p>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${connected ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-xs text-muted-foreground">
                            {typing ? "Typing..." : connected ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>

                <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs flex-shrink-0"
                    onClick={async () => {
                        try {
                            await axios.put(`/api/appointments/${appointmentId}`, { status: "completed" })
                            toast.success("Consultation ended")
                            router.push("/patient/appointment")
                        } catch { toast.error("Failed to end consultation") }
                    }}
                >
                    End
                </Button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {groupedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={chatRoom.doctor?.avatar} />
                                <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <p className="font-medium text-sm">Dr. {doctorName}</p>
                            <p className="text-xs text-muted-foreground mt-1">Send a message to start your consultation</p>
                        </div>
                    </div>
                ) : (
                    groupedMessages.map((message, index) => {
                        const mine = isMyMessage(message)
                        const key = message.messageId || `${message.senderId}-${message.timestamp}-${index}`
                        const isFile = message.messageType === "file" || message.messageType === "image"

                        return (
                            <div key={key}>
                                {message.showDate && (
                                    <div className="flex items-center gap-2 my-4">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs text-muted-foreground px-2 flex-shrink-0">{formatDate(message.timestamp)}</span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                )}

                                <div className={`flex gap-2 mb-1 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                                    {!mine && (
                                        <Avatar className="h-6 w-6 flex-shrink-0 mt-1">
                                            <AvatarImage src={chatRoom.doctor?.avatar} />
                                            <AvatarFallback className="text-xs">{doctorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={`flex flex-col gap-0.5 max-w-[75%] sm:max-w-[60%] ${mine ? "items-end" : "items-start"}`}>
                                        {isFile ? (
                                            <FileMessage
                                                fileUrl={message.fileData?.url || message.fileUrl}
                                                fileName={message.fileData?.name || message.fileName || "File"}
                                                fileSize={message.fileData?.size || message.fileSize || 0}
                                                fileType={message.fileData?.type || message.fileType || "application/octet-stream"}
                                                messageType={message.messageType}
                                                isMyMessage={mine}
                                            />
                                        ) : (
                                            <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${mine
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted text-foreground rounded-bl-sm"
                                                }`}>
                                                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                            </div>
                                        )}
                                        <span className="text-xs text-muted-foreground px-1">{formatTime(message.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 border-t bg-background px-4 py-3">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <FileUpload onFileUploaded={handleFileUploaded} roomId={chatRoom?.roomId || ""} disabled={!connected} />
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => { handleTyping(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px" }}
                            onKeyDown={handleKeyDown}
                            placeholder={connected ? "Type a message..." : "Connecting..."}
                            disabled={!connected}
                            rows={1}
                            className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-h-[40px] max-h-[120px] overflow-y-auto"
                            style={{ height: "40px" }}
                        />
                    </div>
                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !connected}
                        size="icon"
                        className="h-10 w-10 rounded-full flex-shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}