"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import TelehealthVideoCall from "./TelehealthVideoCall"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video } from "lucide-react"
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

export default function PatientVideoCall() {
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
                console.log("Fetched appointment from API:", response.data.appointment)
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
            } else {
                toast.error("Failed to start video call")
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
            toast.loading("Ending call...")
            if (callData?.callId) {
                await axios.post("/api/video/end", {
                    callId: callData.callId,
                })
            }
            toast.success("Call ended successfully")
        } catch (err) {
            
            toast.error("Redirecting")
        } finally {
            setCallActive(false)
            setCallData(null)
            router.push("/patient/appointment")
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user || authError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md mx-auto">
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">Authentication required</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full sm:w-auto">
                        Go to Login
                    </Button>
                </div>
            </div>
        )
    }

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md mx-auto">
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">No appointment ID provided</p>
                    <Button onClick={() => router.push("/patient/appointments")} className="w-full sm:w-auto">
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
                roomId={appointmentDetails?.roomId}
                userId={user._id}
                username={user.username || user.name}
                userType="patient"
                patientInfo={callData.appointment?.patientInfo}
                doctorInfo={callData.appointment?.doctorInfo}
                onCallEnd={handleCallEnd}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/patient/appointments")}
                        className="p-1 sm:p-2 flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold">Video Call</h1>
                </div>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-primary" />
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Start Video Call</h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                            Ready to start your video consultation with your doctor?
                        </p>

                        {error && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm sm:text-base">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={initiateVideoCall}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    <span className="text-sm sm:text-base">Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" />
                                    <span className="text-sm sm:text-base">Start Video Call</span>
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}