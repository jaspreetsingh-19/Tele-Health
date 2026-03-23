"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import TelehealthVideoCall from "./TelehealthVideoCall"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video, Clock } from "lucide-react"
import { toast } from "sonner"

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
            } catch (err) {
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

// Check if current time is within the appointment window (5 min early, 30 min after end)
function getCallTimeStatus(timeSlot, appointmentDate) {
    if (!timeSlot || !appointmentDate) return { allowed: true }
    try {
        const now = new Date()
        
        // Get just the date part from appointmentDate
        const dateStr = new Date(appointmentDate).toISOString().split('T')[0]
        
        const start = new Date(`${dateStr}T${timeSlot.startTime}:00`)
        const end = timeSlot.endTime
            ? new Date(`${dateStr}T${timeSlot.endTime}:00`)
            : new Date(start.getTime() + 30 * 60 * 1000)

        const windowStart = new Date(start.getTime() - 5 * 60 * 1000)   // 5 min early
        const windowEnd = new Date(end.getTime() + 30 * 60 * 1000)       // 30 min after end

        if (now < windowStart) {
            return {
                allowed: false, reason: 'early',
                minutesUntilStart: Math.ceil((windowStart - now) / 60000)
            }
        }
        if (now > windowEnd) {
            return {
                allowed: false, reason: 'expired',
                minutesPastEnd: Math.floor((now - windowEnd) / 60000)
            }
        }
        return { allowed: true }
    } catch (e) {
        console.error('timeSlot parse error:', e)
        return { allowed: true }
    }
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
        const fetchAppointmentDetails = async () => {
            if (!appointmentId || !user) return
            try {
                const response = await axios.get(`/api/appointments/${appointmentId}`)
                
                setAppointmentDetails(response.data.appointment)
            } catch (err) {
                toast.error("Failed to load appointment details")
            }
        }
        fetchAppointmentDetails()
    }, [appointmentId, user])

    // AFTER
const timeStatus = appointmentDetails ? getCallTimeStatus(appointmentDetails.timeSlot, appointmentDetails.appointmentDate) : { allowed: true }

    const initiateVideoCall = async () => {
        // Double-check time before initiating
        const status = getCallTimeStatus(appointmentDetails?.timeSlot, appointmentDetails?.appointmentDate)
        if (!status.allowed) {
            if (status.reason === 'early') {
                toast.error(`Too early! You can join in ${status.minutesUntilStart} minutes.`)
            } else {
                toast.error('This appointment has expired.')
            }
            return
        }

        try {
            setLoading(true)
            setError(null)
            const response = await axios.post("/api/video/initiate", { appointmentId })
            if (response.data.success) {
                setCallData(response.data)
                setCallActive(true)
                toast.success("Video call started successfully")
            } else {
                toast.error("Failed to start video call")
            }
        } catch (err) {
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
                await axios.post("/api/video/end", { callId: callData.callId })
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
                    <p className="mt-2 text-sm text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user || authError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-4">Authentication required</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full sm:w-auto">Go to Login</Button>
                </div>
            </div>
        )
    }

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-4">No appointment ID provided</p>
                    <Button onClick={() => router.push("/patient/appointments")} className="w-full sm:w-auto">Go to Appointments</Button>
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
                timeSlot={appointmentDetails?.timeSlot}  // ← pass timeSlot
                appointmentDate={appointmentDetails?.appointmentDate} 
                onCallEnd={handleCallEnd}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/patient/appointments")} className="p-1 sm:p-2 flex-shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold">Video Call</h1>
                </div>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-primary" />
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Start Video Call</h2>

                        {/* Time slot info */}
                        {appointmentDetails?.timeSlot && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {appointmentDetails.timeSlot.startTime} – {appointmentDetails.timeSlot.endTime || '(30 min)'}
                                </span>
                            </div>
                        )}

                        {/* Time warning */}
                        {!timeStatus.allowed && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${timeStatus.reason === 'expired' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                {timeStatus.reason === 'early'
                                    ? `Available in ${timeStatus.minutesUntilStart} min. You can join 5 minutes early.`
                                    : `This appointment expired ${timeStatus.minutesPastEnd} min ago.`
                                }
                            </div>
                        )}

                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                            Ready to start your video consultation with your doctor?
                        </p>

                        {error && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={initiateVideoCall}
                            disabled={loading || !timeStatus.allowed}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Connecting...
                                </>
                            ) : !timeStatus.allowed ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    {timeStatus.reason === 'early' ? `Opens in ${timeStatus.minutesUntilStart} min` : 'Appointment Expired'}
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" />
                                    Start Video Call
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}