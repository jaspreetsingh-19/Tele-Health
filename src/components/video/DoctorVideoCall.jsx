"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import TelehealthVideoCall from "./TelehealthVideoCall"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

// Custom hook for authentication
const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("/api/auth/me")
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

export default function DoctorVideoCall() {
    const { user, loading: authLoading, error: authError } = useAuth()
    const searchParams = useSearchParams()
    const router = useRouter()
    const appointmentId = searchParams.get("appointmentId")

    const [callData, setCallData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [callActive, setCallActive] = useState(false)
    const [appointmentDetails, setAppointmentDetails] = useState(null)

    useEffect(() => {
        if (appointmentDetails) {
            console.log("appointmentDetails updated:", appointmentDetails)
        }
    }, [appointmentDetails])

    // Fetch appointment details
    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            if (!appointmentId || !user) return

            try {
                const response = await axios.get(`/api/appointments/${appointmentId}`)
                // console.log("Fetched appointment from API:", response.data.appointment)
                setAppointmentDetails(response.data.appointment)
                toast.success("Appointment details loaded")
            } catch (err) {
                console.error("Error fetching appointment details:", err)
                toast.error("Failed to load appointment details")
            }
        }

        fetchAppointmentDetails()
    }, [appointmentId, user])

    const initiateVideoCall = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await axios.post("/api/video/initiate", {
                appointmentId,
            })

            if (response.data.success) {
                setCallData(response.data)
                setCallActive(true)
                toast.success("Video call started successfully")
            }
        } catch (err) {
            console.error("Error initiating video call:", err)
            const errorMessage = err.response?.data?.error || "Failed to initiate video call"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleCallEnd = async () => {
        try {


            if (callData?.callId) {
                await axios.post("/api/video/end", {
                    callId: callData.callId,
                })
            }

            toast.success("Video call ended")
        } catch (err) {
            console.error("Error ending call:", err)
            toast.error("Error ending call")
        } finally {
            setCallActive(false)
            setCallData(null)
            router.push("/doctor/appointments")
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground text-sm md:text-base">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user || authError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-sm mx-auto">
                    <p className="text-muted-foreground text-sm md:text-base mb-4">Authentication required</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full md:w-auto">
                        Go to Login
                    </Button>
                </div>
            </div>
        )
    }

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-sm mx-auto">
                    <p className="text-muted-foreground text-sm md:text-base mb-4">No appointment ID provided</p>
                    <Button onClick={() => router.push("/doctor/appointments")} className="w-full md:w-auto">
                        Go to Appointments
                    </Button>
                </div>
            </div>
        )
    }

    if (callActive && callData) {
        return (
            <TelehealthVideoCall
                callId={callData.callId}
                roomId={appointmentDetails.roomId}
                userId={user._id}
                username={user.username || user.name}
                userType="doctor"
                patientInfo={callData.appointment.patientInfo}
                doctorInfo={callData.appointment.doctorInfo}
                onCallEnd={handleCallEnd}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background p-3 md:p-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/doctor/appointments")}
                        className="p-2 flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl md:text-2xl font-bold">Video Call</h1>
                </div>

                {/* Main Content Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-4 md:p-6 text-center">
                        {/* Video Icon */}
                        <Video className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-primary" />

                        {/* Title */}
                        <h2 className="text-lg md:text-xl font-semibold mb-2">Start Video Call</h2>

                        {/* Patient Information */}
                        {appointmentDetails && (
                            <div className="mb-4 p-3 md:p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-3 justify-center mb-2 flex-wrap">
                                    <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                                        <AvatarImage src={appointmentDetails.patientId?.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xs md:text-sm">
                                            {appointmentDetails.patientId?.username?.charAt(0) || "P"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center sm:text-left">
                                        <p className="font-medium text-sm md:text-base">
                                            {appointmentDetails.patientId?.username}
                                        </p>
                                        <p className="text-xs md:text-sm text-muted-foreground">Patient</p>
                                    </div>
                                </div>

                                {/* Symptoms - Responsive display */}
                                <div className="mt-2">
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        <span className="font-medium">Symptoms:</span>
                                    </p>
                                    <p className="text-xs md:text-sm text-foreground mt-1 break-words">
                                        {appointmentDetails.symptoms}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-muted-foreground mb-6 text-sm md:text-base px-2">
                            Ready to start your video consultation with your patient?
                        </p>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm md:text-base">
                                {error}
                            </div>
                        )}

                        {/* Start Call Button */}
                        <Button
                            onClick={initiateVideoCall}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    <span className="text-sm md:text-base">Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" />
                                    <span className="text-sm md:text-base">Start Video Call</span>
                                </>
                            )}
                        </Button>

                        {/* Additional Info for Mobile */}
                        <div className="mt-4 sm:hidden">
                            <p className="text-xs text-muted-foreground">
                                Make sure you have a stable internet connection for the best experience.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tips Card for Desktop */}
                <Card className="mt-4 hidden sm:block">
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">Video Call Tips:</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Ensure you have a stable internet connection</li>
                            <li>• Check your camera and microphone permissions</li>
                            <li>• Find a quiet, well-lit environment</li>
                            <li>• Keep patient information confidential</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}