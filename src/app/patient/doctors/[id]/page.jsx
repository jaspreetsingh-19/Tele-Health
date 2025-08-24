"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Calendar, Video, MessageCircle, Star, MapPin, Award, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { toast } from "@/hooks/use-toast"
import axios from "axios"
import Link from "next/link"
import BookingModal from "@/components/BookingModal"

export default function DoctorProfilePage() {
    const params = useParams()
    const [doctor, setDoctor] = useState(null)
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedSlot, setSelectedSlot] = useState(null)

    const fetchDoctorProfile = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/doctors`)
            if (response.data.success) {
                const foundDoctor = response.data.doctors.find((d) => d._id === params.id)
                setDoctor(foundDoctor)
            }
        } catch (error) {
            // toast({
            //     title: "Error",
            //     description: "Failed to fetch doctor profile",
            //     variant: "destructive",
            // })
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailability = async () => {
        try {
            const startDate = new Date().toISOString().split("T")[0]
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

            const response = await axios.get(
                `/api/doctor-availability?doctorId=${params.id}&startDate=${startDate}&endDate=${endDate}`,
            )
            if (response.data.success) {
                setAvailability(response.data.availability)
            }
        } catch (error) {
            console.error("Error fetching availability:", error)
        }
    }

    const handleSlotSelect = (date, slot) => {
        setSelectedDate(date)
        setSelectedSlot(slot)
        setShowBookingModal(true)
    }

    const getNext7Days = () => {
        const days = []
        for (let i = 0; i < 7; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            days.push({
                date: date.toISOString().split("T")[0],
                display: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                isToday: i === 0,
            })
        }
        return days
    }

    const getAvailabilityForDate = (date) => {
        return availability.find((avail) => avail.date.split("T")[0] === date)
    }

    useEffect(() => {
        if (params.id) {
            fetchDoctorProfile()
            fetchAvailability()
        }
    }, [params.id])

    if (loading || !doctor) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground">Loading doctor profile...</div>
            </div>
        )
    }

    const profile = doctor.doctorProfile
    const next7Days = getNext7Days()

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Back Button */}
                <Link href="/patient/doctors">
                    <Button variant="outline" className="mb-4 bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Doctors
                    </Button>
                </Link>

                {/* Doctor Profile Header */}
                <Card>
                    <CardContent className="p-8">
                        <div className="flex flex-col gap-6 md:flex-row">
                            <Avatar className="h-32 w-32 mx-auto md:mx-0">
                                <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={profile.fullName} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {profile.fullName?.charAt(0) || doctor.username?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{profile.fullName}</h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                        <Star className="h-5 w-5 fill-accent text-accent" />
                                        <span className="font-medium">{profile.rating || 0}</span>
                                        <span className="text-muted-foreground">({profile.totalRatings || 0} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {profile.specialization?.map((spec, index) => (
                                        <Badge key={index} className="bg-primary text-primary-foreground">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="text-sm">{profile.experienceYears} years experience</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="text-sm">{profile.totalConsultations || 0} consultations</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-sm">
                                            {profile.clinicAddress?.city}, {profile.clinicAddress?.state}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center md:text-left">
                                    <span className="text-sm text-muted-foreground">Consultation Fee: </span>
                                    <span className="text-2xl font-bold text-primary">₹{profile.consultationFee}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="availability" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="availability">Book Appointment</TabsTrigger>
                        <TabsTrigger value="about">About Doctor</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="availability">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Available Time Slots
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {next7Days.map((day) => {
                                        const dayAvailability = getAvailabilityForDate(day.date)
                                        const availableSlots = dayAvailability?.timeSlots?.filter((slot) => !slot.isBooked) || []

                                        return (
                                            <div key={day.date} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{day.display}</h3>
                                                    {day.isToday && <Badge className="bg-accent text-accent-foreground">Today</Badge>}
                                                </div>

                                                {!dayAvailability?.isAvailable ? (
                                                    <p className="text-sm text-muted-foreground">Doctor not available on this day</p>
                                                ) : availableSlots.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No available slots</p>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                                                        {availableSlots.map((slot, index) => (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSlotSelect(day.date, slot)}
                                                                className="hover:bg-primary hover:text-primary-foreground"
                                                            >
                                                                {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString("en-US", {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="about">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Dr. {profile.fullName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Qualifications</h4>
                                    <p className="text-muted-foreground">{profile.qualifications}</p>
                                </div>

                                {profile.bio && (
                                    <div>
                                        <h4 className="font-medium mb-2">About</h4>
                                        <p className="text-muted-foreground">{profile.bio}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium mb-2">Specializations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specialization?.map((spec, index) => (
                                            <Badge key={index} variant="secondary">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {profile.clinicAddress && (
                                    <div>
                                        <h4 className="font-medium mb-2">Clinic Address</h4>
                                        <p className="text-muted-foreground">
                                            {profile.clinicAddress.address}
                                            <br />
                                            {profile.clinicAddress.city}, {profile.clinicAddress.state} - {profile.clinicAddress.pincode}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium mb-2">Consultation Options</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-primary" />
                                            <span className="text-sm">Video Call</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-primary" />
                                            <span className="text-sm">Chat</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                                    <p className="text-muted-foreground">Be the first to review this doctor.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    doctor={doctor}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={() => {
                        setShowBookingModal(false)
                        fetchAvailability()
                    }}
                />
            )}
        </div>
    )
}
