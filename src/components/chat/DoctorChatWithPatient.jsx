"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import io from "socket.io-client"
import axios from "axios"
import { Send, ArrowLeft, Phone, Video, Smile, FileText, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import FileUpload from "@/components/FileUpload"
import FileMessage from "@/components/FileMessage"
import { toast } from "sonner"

// Custom hook for authentication
const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("Fetching user from /api/auth/me")
                const response = await axios.get("/api/auth/me")
                console.log("User response:", response.data)

                // Fix: Handle different response structures
                const userData = response.data.data || response.data.user || response.data
                setUser(userData)
                setError(null)
                toast.success("Authentication successful")
            } catch (err) {
                console.error("Auth error:", err.response?.data || err.message)
                const errorMessage = err.response?.data?.message || "Authentication failed"
                setError(errorMessage)
                setUser(null)
                toast.error(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { user, loading, error }
}

export default function DoctorChatWithPatient() {
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
    const [onlineUsers, setOnlineUsers] = useState([])
    const [showPrescription, setShowPrescription] = useState(false)
    const [prescription, setPrescription] = useState({
        medicines: [],
        advice: "",
        followUpDate: "",
    })

    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Initialize chat room
    const initializeChatRoom = async () => {
        try {
            setLoading(true)
            console.log("Initializing chat room with appointmentId:", appointmentId)

            const response = await axios.post("/api/chat", { appointmentId })
            console.log("Chat room response:", response.data)

            if (response.data.success) {
                setChatRoom(response.data.chatRoom)
                setMessages(response.data.chatRoom.messages || [])
                toast.success("Chat room loaded successfully")
                console.log("Chat room initialized successfully")
            } else {
                console.error("Failed to initialize chat room:", response.data)
                toast.error("Failed to initialize chat room")
            }
        } catch (error) {
            console.error("Error initializing chat room:", error.response?.data || error.message)
            toast.error("Error loading chat room")
        } finally {
            setLoading(false)
        }
    }

    // Initialize chat room when user is authenticated
    useEffect(() => {
        if (user && appointmentId) {
            initializeChatRoom()
        }
    }, [user, appointmentId])

    // Socket connection setup
    useEffect(() => {
        if (!chatRoom || !user) return
console.log('🔌 Socket URL:', process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
console.log('🌍 All env vars:', process.env)
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
            transports: ["websocket", "polling"],
        })

        newSocket.on("connect", () => {
            console.log("Connected to socket server")
            setConnected(true)
            toast.success("Connected to chat")

            // Join the chat room
            newSocket.emit("join-room", {
                roomId: chatRoom.roomId,
                username: user.username || user.name,
                userId: user._id || user.id,
            })
        })

        newSocket.on("disconnect", () => {
            console.log("Disconnected from socket server")
            setConnected(false)
            toast.error("Disconnected from chat")
        })

        // Fix: Prevent duplicate messages by checking if message already exists
        newSocket.on("receiveMessage", (messageData) => {
            console.log("Received message:", messageData)
            setMessages((prev) => {
                if (messageData.senderId === (user._id || user.id)) {
                    console.log("Skipping own message (already added optimistically)")
                    return prev
                }

                // Check if message already exists to prevent duplicates
                const messageExists = prev.some(
                    (msg) =>
                        msg.messageId === messageData.messageId ||
                        (msg.senderId === messageData.senderId &&
                            msg.message === messageData.content &&
                            Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 1000),
                )

                if (messageExists) {
                    console.log("Message already exists, skipping duplicate")
                    return prev
                }

                // Show toast for new message from patient
                if (messageData.senderRole !== "doctor") {
                    toast.info("New message received")
                }

                return [
                    ...prev,
                    {
                        senderId: messageData.senderId,
                        senderType: messageData.senderRole === "doctor" ? "doctor" : "patient",
                        message: messageData.content,
                        messageType: messageData.type || "text",
                        timestamp: messageData.timestamp,
                        messageId: messageData.messageId,
                        fileData: messageData.fileData, // Added to handle file messages
                    },
                ]
            })
        })

        newSocket.on("typing", (data) => {
            if (data.userId !== (user._id || user.id)) {
                setTyping(data.isTyping)
            }
        })

        newSocket.on("user-joined", (data) => {
            console.log("User joined:", data)
            toast.info(`${data.username} joined the chat`)
        })

        newSocket.on("user-left", (data) => {
            console.log("User left:", data)
            toast.info(`${data.username} left the chat`)
        })

        newSocket.on("room-info", (data) => {
            setOnlineUsers(data.participants || [])
        })

        newSocket.on("error", (error) => {
            console.error("Socket error:", error)
            toast.error("Connection error occurred")
        })

        newSocket.on("messageError", (error) => {
            console.error("Message error:", error)
            toast.error("Failed to send message")
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [chatRoom, user])

    const sendMessage = () => {
        if (!newMessage.trim() || !socket || !chatRoom || !user) return

        const messagePayload = {
            roomId: chatRoom.roomId,
            content: newMessage.trim(),
            sender: user.username || user.name,
            senderId: user._id || user.id,
            senderRole: "doctor",
            type: "text",
        }

        const optimisticMessage = {
            senderId: user._id || user.id,
            senderType: "doctor",
            message: newMessage.trim(),
            messageType: "text",
            timestamp: new Date().toISOString(),
            messageId: `temp-${Date.now()}`, // Temporary ID for optimistic update
        }

        setMessages((prev) => [...prev, optimisticMessage])
        console.log("Sending message:", messagePayload)
        socket.emit("sendMessage", messagePayload)
        setNewMessage("")

        // Stop typing indicator
        socket.emit("typing", {
            roomId: chatRoom.roomId,
            userId: user._id || user.id,
            isTyping: false,
        })
    }

    const handleFileUploaded = (fileData) => {
        if (!socket || !chatRoom || !user) return

        const fileMessagePayload = {
            roomId: chatRoom.roomId,
            content: `Shared a file: ${fileData.originalName}`,
            sender: user.username || user.name,
            senderId: user._id || user.id,
            senderRole: "doctor",
            type: fileData.type.startsWith("image/") ? "image" : "file",
            fileData: {
                url: fileData.url,
                name: fileData.originalName,
                size: fileData.size,
                type: fileData.type,
                publicId: fileData.publicId,
            },
        }

        const optimisticFileMessage = {
            senderId: user._id || user.id,
            senderType: "doctor",
            message: `Shared a file: ${fileData.originalName}`,
            messageType: fileData.type.startsWith("image/") ? "image" : "file",
            timestamp: new Date().toISOString(),
            messageId: `temp-file-${Date.now()}`,
            fileData: {
                url: fileData.url,
                name: fileData.originalName,
                size: fileData.size,
                type: fileData.type,
                publicId: fileData.publicId,
            },
        }

        setMessages((prev) => [...prev, optimisticFileMessage])
        console.log("Sending file message:", fileMessagePayload)
        socket.emit("sendMessage", fileMessagePayload)
        toast.success("File uploaded successfully")
    }

    const handleTyping = (value) => {
        setNewMessage(value)

        if (!socket || !chatRoom) return

        // Emit typing indicator
        socket.emit("typing", {
            roomId: chatRoom.roomId,
            userId: user._id || user.id,
            isTyping: value.length > 0,
        })

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", {
                roomId: chatRoom.roomId,
                userId: user._id || user.id,
                isTyping: false,
            })
        }, 1000)
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const isMyMessage = (message) => {
        return message.senderId === (user?._id || user?.id)
    }

    const endConsultation = async () => {
        try {
            const response = await axios.put(`/api/appointments/${appointmentId}`, {
                status: "completed",
                prescription: prescription,
            })

            if (response.status === 200) {
                // Emit consultation ended event
                socket?.emit("consultationUpdate", {
                    roomId: chatRoom.roomId,
                    status: "completed",
                    updatedBy: user._id || user.id,
                })

                toast.success("Consultation ended successfully")
                router.push("/doctor/appointments")
            }
        } catch (error) {
            console.error("Error ending consultation:", error)
            toast.error("Failed to end consultation")
        }
    }

    // Debug logging
    console.log(
        "Debug - authLoading:",
        authLoading,
        "loading:",
        loading,
        "user:",
        user,
        "authError:",
        authError,
        "appointmentId:",
        appointmentId,
    )

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user || authError) {
        console.log("Auth failed, redirecting to login. User:", user, "Error:", authError)
        router.push("/auth/login")
        return null
    }

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <p className="text-muted-foreground">No appointment ID provided</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading chat room...</p>
                </div>
            </div>
        )
    }

    if (!chatRoom) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <p className="text-muted-foreground">Failed to load chat room</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    // Prescription Panel Component (for both desktop and mobile)
    const PrescriptionPanel = ({ className = "" }) => (
        <div className={className}>
            <Card className="h-full rounded-none border-0 md:border">
                <CardHeader className="border-b">
                    <h3 className="font-semibold">Prescription & Notes</h3>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Doctor's Advice</label>
                        <Textarea
                            value={prescription.advice}
                            onChange={(e) =>
                                setPrescription((prev) => ({
                                    ...prev,
                                    advice: e.target.value,
                                }))
                            }
                            placeholder="Enter your advice and recommendations..."
                            className="mt-1"
                            rows={4}
                        />
                    </div>

                    <Separator />

                    <div>
                        <label className="text-sm font-medium">Follow-up Date</label>
                        <Input
                            type="date"
                            value={prescription.followUpDate}
                            onChange={(e) =>
                                setPrescription((prev) => ({
                                    ...prev,
                                    followUpDate: e.target.value,
                                }))
                            }
                            className="mt-1"
                        />
                    </div>

                    <Separator />

                    <div>
                        <label className="text-sm font-medium">Patient Information</label>
                        <div className="mt-2 space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Name:</span>{" "}
                                {chatRoom.patient?.patientProfile?.fullName || chatRoom.patient?.username}
                            </div>
                            <div>
                                <span className="font-medium">Age:</span> {chatRoom.patient?.patientProfile?.age || "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Gender:</span> {chatRoom.patient?.patientProfile?.gender || "N/A"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="flex h-screen bg-background">
            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <Card className="rounded-none border-b flex-shrink-0">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-3 md:py-4 md:px-6">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2 flex-shrink-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                                <AvatarImage src={chatRoom.patient?.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                    {chatRoom.patient?.patientProfile?.fullName?.[0] || chatRoom.patient?.username?.[0] || "P"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-sm md:text-base truncate">
                                    {chatRoom.patient?.patientProfile?.fullName || chatRoom.patient?.username}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant={connected ? "default" : "secondary"} className="text-xs">
                                        {connected ? "Online" : "Offline"}
                                    </Badge>
                                    {typing && <span className="text-xs text-muted-foreground hidden sm:inline">Patient is typing...</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            {/* Mobile Prescription Sheet */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="md:hidden">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-80">
                                    <SheetHeader>
                                        <SheetTitle>Prescription & Notes</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <PrescriptionPanel />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Desktop Action Buttons */}
                            <div className="hidden sm:flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Video className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setShowPrescription(!showPrescription)}>
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button variant="destructive" size="sm" onClick={endConsultation} className="text-xs md:text-sm">
                                <span className="hidden sm:inline">End Consultation</span>
                                <span className="sm:hidden">End</span>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Messages */}
                <ScrollArea className="flex-1 px-2 md:px-4">
                    <div className="space-y-4 py-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground text-sm md:text-base">
                                    Start your consultation with{" "}
                                    {chatRoom.patient?.patientProfile?.fullName || chatRoom.patient?.username}
                                </p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const showDate =
                                    index === 0 ||
                                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(message.timestamp).toDateString()

                                // Use a more unique key combining multiple identifiers
                                const messageKey = message.messageId || `${message.senderId}-${message.timestamp}-${index}`

                                return (
                                    <div key={messageKey}>
                                        {showDate && (
                                            <div className="text-center py-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {formatDate(message.timestamp)}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className={`flex gap-2 md:gap-3 ${isMyMessage(message) ? "flex-row-reverse" : "flex-row"}`}>
                                            <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                                                {isMyMessage(message) ? (
                                                    <>
                                                        <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="text-xs">{user?.name?.[0] || "D"}</AvatarFallback>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AvatarImage src={chatRoom.patient?.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="text-xs">{chatRoom.patient?.patientProfile?.fullName?.[0] || "P"}</AvatarFallback>
                                                    </>
                                                )}
                                            </Avatar>

                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] ${isMyMessage(message) ? "items-end" : "items-start"} flex flex-col gap-1`}
                                            >
                                                {message.messageType === "file" || message.messageType === "image" ? (
                                                    <div>
                                                        {(() => {
                                                            console.log("[v0] Rendering file message:", {
                                                                messageType: message.messageType,
                                                                fileData: message.fileData,
                                                                message: message,
                                                            })

                                                            // Try different possible property names for file URL
                                                            const fileUrl =
                                                                message.fileData?.url || message.fileUrl || message.url || message.file?.url
                                                            const fileName =
                                                                message.fileData?.name ||
                                                                message.fileName ||
                                                                message.name ||
                                                                message.file?.name ||
                                                                "Unknown file"
                                                            const fileSize =
                                                                message.fileData?.size || message.fileSize || message.size || message.file?.size || 0
                                                            const fileType =
                                                                message.fileData?.type ||
                                                                message.fileType ||
                                                                message.type ||
                                                                message.file?.type ||
                                                                "application/octet-stream"

                                                            console.log("[v0] File props extracted:", {
                                                                fileUrl,
                                                                fileName,
                                                                fileSize,
                                                                fileType,
                                                            })

                                                            return (
                                                                <FileMessage
                                                                    fileUrl={fileUrl}
                                                                    fileName={fileName}
                                                                    fileSize={fileSize}
                                                                    fileType={fileType}
                                                                    messageType={message.messageType}
                                                                    isMyMessage={isMyMessage(message)}
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`rounded-lg px-3 py-2 break-words text-sm md:text-base ${isMyMessage(message) ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap">{message.message}</p>
                                                    </div>
                                                )}
                                                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <Card className="rounded-none border-t flex-shrink-0">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex items-end gap-2">
                            <FileUpload onFileUploaded={handleFileUploaded} roomId={chatRoom?.roomId || ""} disabled={!connected} />

                            <div className="flex-1">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="resize-none"
                                    disabled={!connected}
                                />
                            </div>

                            <Button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || !connected}
                                size="sm"
                                className="flex-shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Desktop Prescription Panel */}
            {showPrescription && (
                <div className="hidden md:block w-80 border-l bg-muted/30 flex-shrink-0">
                    <PrescriptionPanel />
                </div>
            )}
        </div>
    )
}