"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Video, MessageCircle, FileText, Filter, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { toast } from "@/hooks/use-toast"
import axios from "axios"
import ConsultationControls from "@/components/ConsultationControls"
import { useRouter } from "next/navigation"


export default function DoctorAppointmentsPage() {
    return (

        <DoctorAppointmentsContent />

    )
}

function DoctorAppointmentsContent() {
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
                role: "doctor",
                ...(filter.status !== "all" && { status: filter.status }),
                ...(filter.date && { date: filter.date }),
            })

            const response = await axios.get(`/api/appointments?${params}`)
            if (response.data.success) {
                let filteredAppointments = response.data.appointments


                if (filter.consultationType !== "all") {
                    filteredAppointments = filteredAppointments.filter((apt) => apt.consultationType === filter.consultationType)
                }

                setAppointments(filteredAppointments)
            }
        } catch (error) {
            // toast({
            //     title: "Error",
            //     description: "Failed to fetch appointments",
            //     variant: "destructive",
            // })
        } finally {
            setLoading(false)
        }
    }

    const updateAppointmentStatus = async (appointmentId, status) => {
        try {
            const response = await axios.put(`/api/appointments/${appointmentId}`, { status })
            if (response.data.success) {
                // toast({
                //     title: "Success",
                //     description: "Appointment status updated",
                // })
                fetchAppointments()
            }
        } catch (error) {
            // toast({
            //     title: "Error",
            //     description: "Failed to update appointment",
            //     variant: "destructive",
            // })
        }
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


    const getTodayAppointments = () => {
        const today = new Date().toISOString().split("T")[0]
        return appointments.filter((apt) => apt.appointmentDate.split("T")[0] === today)
    }

    const getUpcomingAppointments = () => {
        const today = new Date()
        return appointments.filter((apt) => new Date(apt.appointmentDate) > today && apt.status === "scheduled")
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
                    <p className="text-muted-foreground">Manage your consultation schedule and patient appointments</p>
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
                                <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onStatusUpdate={updateAppointmentStatus}
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
                                <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onStatusUpdate={updateAppointmentStatus}
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
                                <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onStatusUpdate={updateAppointmentStatus}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function AppointmentCard({ appointment, onStatusUpdate }) {
    const [copiedRoomId, setCopiedRoomId] = useState(false)
    const Router = useRouter()
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }
    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(appointment.roomId)
            setCopiedRoomId(true)
            setTimeout(() => setCopiedRoomId(false), 2000)
            // toast({
            //     title: "Copied!",
            //     description: "Room ID copied to clipboard",
            // })
        } catch (err) {
            console.error('Failed to copy room ID:', err)
        }
    }
    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    function handleJoinCall(e) {
        e.preventDefault()
        Router.push("/doctor/chatWithPatient")
    }
    return (

        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                    {appointment.patientId?.patientProfile?.fullName || appointment.patientId?.username}
                                </span>
                            </div>
                            <Badge className="bg-primary text-primary-foreground">{appointment.status}</Badge>
                            <Badge className="bg-accent text-accent-foreground">{appointment.paymentStatus}</Badge>
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
                    </div>

                    <div className="flex flex-col gap-2">
                        {appointment.status === "scheduled" && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => onStatusUpdate(appointment._id, "completed")}
                                    className="bg-accent hover:bg-accent/90"
                                >
                                    Mark Complete
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => onStatusUpdate(appointment._id, "no-show")}>
                                    No Show
                                </Button>
                            </>
                        )}



                        {appointment.consultationType === "video" && appointment.status === "scheduled" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                                onClick={handleJoinCall}
                            >
                                <Video className="mr-2 h-4 w-4" />
                                Join Call
                            </Button>
                        )}

                        {appointment.consultationType === "chat" && appointment.status === "scheduled" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Open Chat
                            </Button>
                        )}
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

                        <ConsultationControls appointment={appointment} userRole="doctor" />
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}
