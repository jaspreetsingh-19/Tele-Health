"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, DollarSign, Clock, TrendingUp, Video, MessageCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { toast } from ""
import axios from "axios"
import Link from "next/link"
import ConsultationControls from "@/components/ConsultationControls"
// import DoctorDashboardLayout from "@/components/DoctorDashboardLayout"

function DoctorDashboardContent({ dashboardData, updateAppointmentStatus, formatDate, formatTime, getStatusColor }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your practice overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/doctor/availability">
                        <Button variant="outline" className="bg-transparent">
                            <Calendar className="mr-2 h-4 w-4" />
                            Manage Availability
                        </Button>
                    </Link>
                    <Link href="/doctor/appointments">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Users className="mr-2 h-4 w-4" />
                            View All Appointments
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                                <p className="text-2xl font-bold">{dashboardData.stats.totalAppointments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{dashboardData.stats.completedAppointments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-chart-1 rounded-full flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">₹{dashboardData.stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-chart-2 rounded-full flex items-center justify-center">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                <p className="text-2xl font-bold">{dashboardData.stats.averageRating}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="today" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        </TabsList>

                        <TabsContent value="today">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        Today's Appointments ({dashboardData.todayAppointments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.todayAppointments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">No appointments today</h3>
                                            <p className="text-muted-foreground">Enjoy your free day!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.todayAppointments.map((appointment) => (
                                                <div
                                                    key={appointment._id}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={appointment.patientId?.avatar || "/placeholder.svg"} />
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {appointment.patientId?.patientProfile?.fullName?.charAt(0) ||
                                                                    appointment.patientId?.username?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">
                                                                {appointment.patientId?.patientProfile?.fullName || appointment.patientId?.username}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {formatTime(appointment.timeSlot.startTime)} -{" "}
                                                                    {formatTime(appointment.timeSlot.endTime)}
                                                                </span>
                                                                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <ConsultationControls appointment={appointment} userRole="doctor" />
                                                        {appointment.status === "scheduled" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                                                                className="bg-accent hover:bg-accent/90"
                                                            >
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="upcoming">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Upcoming Appointments ({dashboardData.upcomingAppointments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.upcomingAppointments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">No upcoming appointments</h3>
                                            <p className="text-muted-foreground">Your schedule is clear for the next week.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.upcomingAppointments.slice(0, 5).map((appointment) => (
                                                <div
                                                    key={appointment._id}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={appointment.patientId?.avatar || "/placeholder.svg"} />
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {appointment.patientId?.patientProfile?.fullName?.charAt(0) ||
                                                                    appointment.patientId?.username?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">
                                                                {appointment.patientId?.patientProfile?.fullName || appointment.patientId?.username}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{formatDate(appointment.appointmentDate)}</span>
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatTime(appointment.timeSlot.startTime)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                appointment.consultationType === "video"
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "bg-accent/10 text-accent"
                                                            }
                                                        >
                                                            {appointment.consultationType === "video" ? (
                                                                <Video className="mr-1 h-3 w-3" />
                                                            ) : (
                                                                <MessageCircle className="mr-1 h-3 w-3" />
                                                            )}
                                                            {appointment.consultationType}
                                                        </Badge>
                                                        <span className="text-sm font-medium">₹{appointment.consultationFee}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Appointments</span>
                                <span className="font-medium">{dashboardData.todayAppointments.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Completed</span>
                                <span className="font-medium">
                                    {dashboardData.todayAppointments.filter((apt) => apt.status === "completed").length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Revenue</span>
                                <span className="font-medium">
                                    ₹
                                    {dashboardData.todayAppointments
                                        .filter((apt) => apt.status === "completed")
                                        .reduce((sum, apt) => sum + apt.consultationFee, 0)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                                    <span className="text-sm font-medium">
                                        {dashboardData.todayAppointments.length > 0
                                            ? Math.round(
                                                (dashboardData.todayAppointments.filter((apt) => apt.status === "completed").length /
                                                    dashboardData.todayAppointments.length) *
                                                100,
                                            )
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        dashboardData.todayAppointments.length > 0
                                            ? (dashboardData.todayAppointments.filter((apt) => apt.status === "completed").length /
                                                dashboardData.todayAppointments.length) *
                                            100
                                            : 0
                                    }
                                    className="h-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Patients */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dashboardData.recentPatients.length === 0 ? (
                                <div className="text-center py-4">
                                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mt-2">No recent patients</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dashboardData.recentPatients.map((patient) => (
                                        <div key={patient._id} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={patient.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {patient.patientProfile?.fullName?.charAt(0) || patient.username?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {patient.patientProfile?.fullName || patient.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {patient.totalAppointments} appointment{patient.totalAppointments !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/doctor/availability">
                                <Button variant="outline" className="w-full justify-start bg-transparent">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Set Availability
                                </Button>
                            </Link>
                            <Link href="/doctor/appointments">
                                <Button variant="outline" className="w-full justify-start bg-transparent">
                                    <Users className="mr-2 h-4 w-4" />
                                    View Appointments
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-start bg-transparent">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function DoctorDashboard() {
    const [dashboardData, setDashboardData] = useState({
        todayAppointments: [],
        upcomingAppointments: [],
        stats: {
            totalAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
            averageRating: 0,
        },
        recentPatients: [],
    })
    const [loading, setLoading] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all appointments
            const appointmentsResponse = await axios.get("/api/appointments?role=doctor")
            if (appointmentsResponse.data.success) {
                const appointments = appointmentsResponse.data.appointments

                // Filter today's appointments
                const today = new Date().toISOString().split("T")[0]
                const todayAppointments = appointments.filter((apt) => apt.appointmentDate.split("T")[0] === today)

                // Filter upcoming appointments (next 7 days)
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                const upcomingAppointments = appointments.filter((apt) => {
                    const aptDate = new Date(apt.appointmentDate)
                    return aptDate > new Date() && aptDate <= nextWeek && apt.status === "scheduled"
                })

                // Calculate stats
                const completedAppointments = appointments.filter((apt) => apt.status === "completed")
                const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.consultationFee, 0)

                // Get recent unique patients
                const patientMap = new Map()
                appointments.forEach((apt) => {
                    if (!patientMap.has(apt.patientId._id)) {
                        patientMap.set(apt.patientId._id, {
                            ...apt.patientId,
                            lastAppointment: apt.appointmentDate,
                            totalAppointments: 1,
                        })
                    } else {
                        const existing = patientMap.get(apt.patientId._id)
                        existing.totalAppointments += 1
                        if (new Date(apt.appointmentDate) > new Date(existing.lastAppointment)) {
                            existing.lastAppointment = apt.appointmentDate
                        }
                    }
                })

                const recentPatients = Array.from(patientMap.values())
                    .sort((a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment))
                    .slice(0, 5)

                setDashboardData({
                    todayAppointments,
                    upcomingAppointments,
                    stats: {
                        totalAppointments: appointments.length,
                        completedAppointments: completedAppointments.length,
                        totalRevenue,
                        averageRating: 4.8, // This would come from a ratings system
                    },
                    recentPatients,
                })
            }
        } catch (error) {
            // toast({
            //     title: "Error",
            //     description: "Failed to fetch dashboard data",
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
                fetchDashboardData()
            }
        } catch (error) {
            // toast({
            //     title: "Error",
            //     description: "Failed to update appointment",
            //     variant: "destructive",
            // })
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
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

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            // <DoctorDashboardLayout>
            //     <div className="min-h-screen bg-background flex items-center justify-center">
            //         <div className="text-muted-foreground">Loading dashboard...</div>
            //     </div>
            // </DoctorDashboardLayout>
            <></>
        )
    }

    return (
        // <DoctorDashboardLayout>
        //     <DoctorDashboardContent
        //         dashboardData={dashboardData}
        //         updateAppointmentStatus={updateAppointmentStatus}
        //         formatDate={formatDate}
        //         formatTime={formatTime}
        //         getStatusColor={getStatusColor}
        //     />
        // </DoctorDashboardLayout>
        <></>

    )
}
