"use client"
import { useState, useEffect } from "react"
import { Calendar, Clock, Video, MessageCircle, FileText, Filter, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PatientAppointmentsPage() {
    const router = useRouter()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({
        status: "all",
        date: "",
        consultationType: "all",
    })

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                role: "patient",
                ...(filter.status !== "all" && { status: filter.status }),
                ...(filter.date && { date: filter.date }),
            })

            const response = await fetch(`/api/appointments?${params}`)
            const data = await response.json()

            if (data.success) {
                let filteredAppointments = data.appointments

                if (filter.consultationType !== "all") {
                    filteredAppointments = filteredAppointments.filter((apt) => apt.consultationType === filter.consultationType)
                }

                setAppointments(filteredAppointments)
            }
        } catch (error) {
            console.error("Error fetching appointments:", error)
            toast.error("Failed to fetch appointments")
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const appointment = appointments.find((apt) => apt._id === appointmentId)
            let response

            if (appointment.paymentStatus === "paid") {
                // Call refund route
                response = await fetch(`/api/payments/refund`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        appointmentId: appointment._id,
                        reason: "User cancelled",
                    }),
                })
            } else {
                // Call simple delete route
                response = await fetch(`/api/appointments/${appointment._id}`, {
                    method: "DELETE",
                })
            }

            const data = await response.json()

            if (response.ok && data.success) {
                toast.success("Appointment cancelled successfully")
                fetchAppointments()
            } else {
                toast.error(data.message || "Failed to cancel appointment")
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error)
            toast.error("Something went wrong")
        }
    }

    // Fixed date comparison functions
    const getTodayAppointments = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return appointments.filter((apt) => {
            const aptDate = new Date(apt.appointmentDate)
            aptDate.setHours(0, 0, 0, 0)
            return aptDate.getTime() === today.getTime()
        })
    }

    const getUpcomingAppointments = () => {
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of today

        return appointments.filter((apt) => {
            const aptDate = new Date(apt.appointmentDate)
            return aptDate > today && apt.status === "scheduled"
        })
    }

    const navigateToChat = (appointmentId) => {
        router.push(`/patient/chatWithDoc?appointmentId=${appointmentId}`)
    }

    const navigateToVideoCall = (appointmentId) => {
        router.push(`/patient/videoCallDoc?appointmentId=${appointmentId}`)
    }

    useEffect(() => {
        fetchAppointments()
    }, [filter])

    const todayAppointments = getTodayAppointments()
    const upcomingAppointments = getUpcomingAppointments()

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Appointments</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">View and manage your healthcare appointments</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {todayAppointments.length} Today
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground text-xs sm:text-sm">
                        {upcomingAppointments.length} Upcoming
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Status</Label>
                            <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no-show">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Consultation Type</Label>
                            <Select
                                value={filter.consultationType}
                                onValueChange={(value) => setFilter({ ...filter, consultationType: value })}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="video">Video Call</SelectItem>
                                    <SelectItem value="chat">Chat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Date</Label>
                            <Input
                                type="date"
                                value={filter.date}
                                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                className="text-sm"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => setFilter({ status: "all", date: "", consultationType: "all" })}
                                className="w-full text-sm"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="today" className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="today" className="text-xs sm:text-sm">
                        Today's
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-xs sm:text-sm">
                        All
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="today">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-muted-foreground text-sm">Loading appointments...</div>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium">No appointments today</h3>
                                        <p className="text-muted-foreground text-sm">You have no scheduled appointments for today.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            todayAppointments.map((appointment) => (
                                <PatientAppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancel={cancelAppointment}
                                    onNavigateToChat={navigateToChat}
                                    onNavigateToVideoCall={navigateToVideoCall}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="upcoming">
                    <div className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium">No upcoming appointments</h3>
                                        <p className="text-muted-foreground text-sm">You have no scheduled upcoming appointments.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingAppointments.map((appointment) => (
                                <PatientAppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancel={cancelAppointment}
                                    onNavigateToChat={navigateToChat}
                                    onNavigateToVideoCall={navigateToVideoCall}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="all">
                    <div className="space-y-4">
                        {appointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium">No appointments found</h3>
                                        <p className="text-muted-foreground text-sm">No appointments match your current filters.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            appointments.map((appointment) => (
                                <PatientAppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancel={cancelAppointment}
                                    onNavigateToChat={navigateToChat}
                                    onNavigateToVideoCall={navigateToVideoCall}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PatientAppointmentCard({ appointment, onCancel, onNavigateToChat, onNavigateToVideoCall }) {
    const [copiedRoomId, setCopiedRoomId] = useState(false)
    const [, forceTimeTick] = useState(0)
    useEffect(() => {
        const id = setInterval(() => forceTimeTick((t) => t + 1), 30000)
        return () => clearInterval(id)
    }, [])

    // Fixed date formatting function
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Kolkata",
        })
    }

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-primary text-primary-foreground"
            case "completed":
                return "bg-accent text-accent-foreground"
            case "cancelled":
                return "bg-destructive text-destructive-foreground"
            case "no-show":
                return "bg-muted text-muted-foreground"
            default:
                return "bg-secondary text-secondary-foreground"
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "paid":
                return "bg-accent text-accent-foreground"
            case "pending":
                return "bg-secondary text-secondary-foreground"
            case "failed":
                return "bg-destructive text-destructive-foreground"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(appointment.roomId)
            setCopiedRoomId(true)
            setTimeout(() => setCopiedRoomId(false), 2000)
            toast.success("Room ID copied to clipboard")
        } catch (err) {
            console.error("Failed to copy room ID:", err)
            toast.error("Failed to copy room ID")
        }
    }

    const canStartChat = () => {
        if (appointment.status !== "scheduled") return false
        if (appointment.consultationType !== "chat") return false

        const start = new Date(appointment.appointmentDate)
        const [h, m] = String(appointment.timeSlot?.startTime || "00:00")
            .split(":")
            .map(Number)
        start.setHours(h || 0, m || 0, 0, 0)

        return Date.now() >= start.getTime() - 15 * 60 * 1000
    }

    const canJoinVideo = () => {
        if (appointment.status !== "scheduled") return false
        if (appointment.consultationType !== "video") return false

        const start = new Date(appointment.appointmentDate)
        const [h, m] = String(appointment.timeSlot?.startTime || "00:00")
            .split(":")
            .map(Number)
        start.setHours(h || 0, m || 0, 0, 0)

        return Date.now() >= start.getTime() - 15 * 60 * 1000
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 self-start sm:self-center">
                                <AvatarImage src={appointment.doctorId?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {appointment.doctorId?.doctorProfile?.fullName?.charAt(0) ||
                                        appointment.doctorId?.username?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <span className="font-medium text-sm sm:text-base">
                                        Dr. {appointment.doctorId?.doctorProfile?.fullName || appointment.doctorId?.username}
                                    </span>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className={`${getStatusColor(appointment.status)} text-xs`}>{appointment.status}</Badge>
                                        <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} text-xs`}>
                                            {appointment.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {appointment.doctorId?.doctorProfile?.specialization?.join(", ")}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>
                                    {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                {appointment.consultationType === "video" ? (
                                    <Video className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                ) : (
                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                )}
                                <span>{appointment.consultationType === "video" ? "Video Call" : "Chat"}</span>
                            </div>
                        </div>

                        <div className="text-xs sm:text-sm">
                            <span className="font-medium">Symptoms: </span>
                            <span className="text-muted-foreground">{appointment.symptoms}</span>
                        </div>

                        <div className="text-xs sm:text-sm">
                            <span className="font-medium">Fee: </span>
                            <span className="text-muted-foreground">₹{appointment.consultationFee}</span>
                        </div>

                       
                        
                    </div>

                    <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[180px]">
                        {appointment.status === "scheduled" && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onCancel(appointment._id)}
                                className="text-xs sm:text-sm w-full"
                            >
                                Cancel
                            </Button>
                        )}

                        {appointment.consultationType === "video" && appointment.status === "scheduled" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent text-xs sm:text-sm w-full"
                                onClick={() => onNavigateToVideoCall(appointment.appointmentId)}
                                disabled={!canJoinVideo()}
                                title={!canJoinVideo() ? "Available 15 minutes before start time" : undefined}
                            >
                                <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Join Call
                            </Button>
                        )}

                        {appointment.consultationType === "chat" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent text-xs sm:text-sm w-full"
                                onClick={() => onNavigateToChat(appointment._id)}
                                disabled={!canStartChat()}
                                title={!canStartChat() ? "Available 15 minutes before start time" : undefined}
                            >
                                <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                {canStartChat() ? "Start Chat" : "Chat"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
