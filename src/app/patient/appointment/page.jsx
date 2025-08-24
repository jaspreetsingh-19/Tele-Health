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
import { useRouter } from 'next/navigation'

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
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchAppointments()
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error)
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
        // Store appointment ID for chat component
        localStorage.setItem('selectedAppointmentId', appointmentId)
        router.push(`/patient/chat?appointmentId=${appointmentId}`)
    }

    useEffect(() => {
        fetchAppointments()
    }, [filter])

    const todayAppointments = getTodayAppointments()
    const upcomingAppointments = getUpcomingAppointments()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
                    <p className="text-muted-foreground">View and manage your healthcare appointments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-primary-foreground">{todayAppointments.length} Today</Badge>
                    <Badge className="bg-accent text-accent-foreground">{upcomingAppointments.length} Upcoming</Badge>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                                <SelectTrigger>
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
                            <Label>Consultation Type</Label>
                            <Select
                                value={filter.consultationType}
                                onValueChange={(value) => setFilter({ ...filter, consultationType: value })}
                            >
                                <SelectTrigger>
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
                            <Label>Date</Label>
                            <Input type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => setFilter({ status: "all", date: "", consultationType: "all" })}
                                className="w-full"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="today" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today">Today's Appointments</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="all">All Appointments</TabsTrigger>
                </TabsList>

                <TabsContent value="today">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-muted-foreground">Loading appointments...</div>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium">No appointments today</h3>
                                        <p className="text-muted-foreground">You have no scheduled appointments for today.</p>
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
                                        <p className="text-muted-foreground">You have no scheduled upcoming appointments.</p>
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
                                        <p className="text-muted-foreground">No appointments match your current filters.</p>
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
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PatientAppointmentCard({ appointment, onCancel, onNavigateToChat }) {
    const [copiedRoomId, setCopiedRoomId] = useState(false)

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
        } catch (err) {
            console.error('Failed to copy room ID:', err)
        }
    }

    const canStartChat = () => {
        if (appointment.status !== 'scheduled') return false
        if (appointment.consultationType !== 'chat') return false

        const appointmentDate = new Date(appointment.appointmentDate)
        const now = new Date()

        // Allow starting chat on the same day
        const appointmentDay = new Date(appointmentDate)
        appointmentDay.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return appointmentDay.getTime() === today.getTime()
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={appointment.doctorId?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {appointment.doctorId?.doctorProfile?.fullName?.charAt(0) ||
                                        appointment.doctorId?.username?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">
                                        Dr. {appointment.doctorId?.doctorProfile?.fullName || appointment.doctorId?.username}
                                    </span>
                                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                    <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                                        {appointment.paymentStatus}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {appointment.doctorId?.doctorProfile?.specialization?.join(", ")}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.appointmentDate)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {appointment.consultationType === "video" ? (
                                    <Video className="h-4 w-4" />
                                ) : (
                                    <MessageCircle className="h-4 w-4" />
                                )}
                                {appointment.consultationType === "video" ? "Video Call" : "Chat"}
                            </div>
                        </div>

                        <div className="text-sm">
                            <span className="font-medium">Symptoms: </span>
                            <span className="text-muted-foreground">{appointment.symptoms}</span>
                        </div>

                        <div className="text-sm">
                            <span className="font-medium">Fee: </span>
                            <span className="text-muted-foreground">₹{appointment.consultationFee}</span>
                        </div>

                        {/* Room ID Block for Video Consultations */}
                        {appointment.consultationType === "video" && appointment.roomId && (
                            <div className="bg-muted/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium">Meeting Room ID:</span>
                                        <div className="text-sm text-muted-foreground font-mono mt-1">
                                            {appointment.roomId}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyRoomId}
                                        className="ml-2"
                                    >
                                        {copiedRoomId ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {appointment.status === "scheduled" && (
                            <Button size="sm" variant="destructive" onClick={() => onCancel(appointment._id)}>
                                Cancel
                            </Button>
                        )}

                        {appointment.consultationType === "video" && appointment.status === "scheduled" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                            >
                                <Video className="mr-2 h-4 w-4" />
                                Join Call
                            </Button>
                        )}

                        {appointment.consultationType === "chat" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                                onClick={() => onNavigateToChat(appointment._id)}
                                disabled={!canStartChat()}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {canStartChat() ? 'Start Chat' : 'Chat'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}