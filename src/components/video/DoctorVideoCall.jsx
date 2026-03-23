"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import TelehealthVideoCall from "./TelehealthVideoCall"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

function getCallTimeStatus(timeSlot) {
    if (!timeSlot) return { allowed: true }
    try {
        const now = new Date()
        let start, end

        if (timeSlot.startTime && timeSlot.date) {
            const dateStr = typeof timeSlot.date === 'string'
                ? timeSlot.date.split('T')[0]
                : new Date(timeSlot.date).toISOString().split('T')[0]
            start = new Date(`${dateStr}T${timeSlot.startTime}:00`)
            end = timeSlot.endTime
                ? new Date(`${dateStr}T${timeSlot.endTime}:00`)
                : new Date(start.getTime() + 30 * 60 * 1000)
        } else if (timeSlot.startTime) {
            start = new Date(timeSlot.startTime)
            end = timeSlot.endTime
                ? new Date(timeSlot.endTime)
                : new Date(start.getTime() + 30 * 60 * 1000)
        } else {
            return { allowed: true }
        }

        const windowStart = new Date(start.getTime() - 5 * 60 * 1000)
        const windowEnd = new Date(end.getTime() + 30 * 60 * 1000)

        if (now < windowStart) {
            return {
                allowed: false, reason: 'early',
                minutesUntilStart: Math.ceil((windowStart - now) / 60000),
                startTime: start
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
        return { allowed: true }
    }
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

    const timeStatus = appointmentDetails ? getCallTimeStatus(appointmentDetails.timeSlot) : { allowed: true }

    const initiateVideoCall = async () => {
        const status = getCallTimeStatus(appointmentDetails?.timeSlot)
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
            toast.success("Video call ended")
        } catch (err) {
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
                    <p className="mt-2 text-muted-foreground text-sm">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user || authError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-sm mx-auto">
                    <p className="text-muted-foreground text-sm mb-4">Authentication required</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full md:w-auto">Go to Login</Button>
                </div>
            </div>
        )
    }

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-sm mx-auto">
                    <p className="text-muted-foreground text-sm mb-4">No appointment ID provided</p>
                    <Button onClick={() => router.push("/doctor/appointments")} className="w-full md:w-auto">Go to Appointments</Button>
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
                userType="doctor"
                patientInfo={callData.appointment?.patientInfo}
                doctorInfo={callData.appointment?.doctorInfo}
                timeSlot={appointmentDetails?.timeSlot}  // ← pass timeSlot
                onCallEnd={handleCallEnd}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background p-3 md:p-4">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/doctor/appointments")} className="p-2 flex-shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl md:text-2xl font-bold">Video Call</h1>
                </div>

                <Card className="shadow-lg">
                    <CardContent className="p-4 md:p-6 text-center">
                        <Video className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-primary" />
                        <h2 className="text-lg md:text-xl font-semibold mb-2">Start Video Call</h2>

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
                                        <p className="font-medium text-sm md:text-base">{appointmentDetails.patientId?.username}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">Patient</p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs md:text-sm text-muted-foreground font-medium">Symptoms:</p>
                                    <p className="text-xs md:text-sm text-foreground mt-1 break-words">{appointmentDetails.symptoms}</p>
                                </div>
                            </div>
                        )}

                        <p className="text-muted-foreground mb-6 text-sm md:text-base px-2">
                            Ready to start your video consultation with your patient?
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