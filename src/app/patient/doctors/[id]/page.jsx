"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Calendar, Video, MessageCircle, Star, MapPin, Award, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
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
                if (foundDoctor) {
                    setDoctor(foundDoctor)
                } else {
                    toast.error("Doctor not found")
                }
            } else {
                toast.error("Failed to fetch doctor profile")
            }
        } catch (error) {
            toast.error("Failed to fetch doctor profile")
            console.error("Error fetching doctor profile:", error)
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
            } else {
                toast.error("Failed to fetch availability")
            }
        } catch (error) {
            toast.error("Failed to fetch availability")
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
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-muted-foreground text-center">
                    <div className="animate-pulse">Loading doctor profile...</div>
                </div>
            </div>
        )
    }

    const profile = doctor.doctorProfile
    const next7Days = getNext7Days()

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                {/* Back Button */}
                <Link href="/patient/doctors">
                    <Button variant="outline" className="mb-4 bg-transparent w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Doctors
                    </Button>
                </Link>

                {/* Doctor Profile Header */}
                <Card>
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row">
                            <div className="flex justify-center md:justify-start">
                                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                                    <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={profile.fullName} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                                        {profile.fullName?.charAt(0) || doctor.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">
                                        {profile.fullName}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2 flex-wrap">
                                        <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-accent text-accent" />
                                        <span className="font-medium text-sm sm:text-base">{profile.rating || 0}</span>
                                        <span className="text-muted-foreground text-sm sm:text-base">
                                            ({profile.totalRatings || 0} reviews)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {profile.specialization?.map((spec, index) => (
                                        <Badge key={index} className="bg-primary text-primary-foreground text-xs sm:text-sm">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <Award className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm">{profile.experienceYears} years experience</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <User className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm">{profile.totalConsultations || 0} consultations</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start sm:col-span-2 lg:col-span-1">
                                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm truncate">
                                            {profile.clinicAddress?.city}, {profile.clinicAddress?.state}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center md:text-left">
                                    <span className="text-xs sm:text-sm text-muted-foreground">Consultation Fee: </span>
                                    <span className="text-xl sm:text-2xl font-bold text-primary">₹{profile.consultationFee}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="availability" className="space-y-4 sm:space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="availability" className="text-xs sm:text-sm p-2 sm:p-3">
                            <span className="hidden sm:inline">Book Appointment</span>
                            <span className="sm:hidden">Book</span>
                        </TabsTrigger>
                        <TabsTrigger value="about" className="text-xs sm:text-sm p-2 sm:p-3">
                            <span className="hidden sm:inline">About Doctor</span>
                            <span className="sm:hidden">About</span>
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="text-xs sm:text-sm p-2 sm:p-3">
                            Reviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="availability">
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    Available Time Slots
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4 sm:space-y-6">
                                    {next7Days.map((day) => {
                                        const dayAvailability = getAvailabilityForDate(day.date)
                                        const availableSlots = dayAvailability?.timeSlots?.filter((slot) => !slot.isBooked) || []

                                        return (
                                            <div key={day.date} className="space-y-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-medium text-sm sm:text-base">{day.display}</h3>
                                                    {day.isToday && (
                                                        <Badge className="bg-accent text-accent-foreground text-xs">Today</Badge>
                                                    )}
                                                </div>

                                                {!dayAvailability?.isAvailable ? (
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        Doctor not available on this day
                                                    </p>
                                                ) : availableSlots.length === 0 ? (
                                                    <p className="text-xs sm:text-sm text-muted-foreground">No available slots</p>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                        {availableSlots.map((slot, index) => (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSlotSelect(day.date, slot)}
                                                                className="hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm p-2 h-auto"
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
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl">About Dr. {profile.fullName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                <div>
                                    <h4 className="font-medium mb-2 text-sm sm:text-base">Qualifications</h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm break-words">
                                        {profile.qualifications}
                                    </p>
                                </div>

                                {profile.bio && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm sm:text-base">About</h4>
                                        <p className="text-muted-foreground text-xs sm:text-sm break-words">{profile.bio}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium mb-2 text-sm sm:text-base">Specializations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specialization?.map((spec, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {profile.clinicAddress && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm sm:text-base">Clinic Address</h4>
                                        <p className="text-muted-foreground text-xs sm:text-sm break-words">
                                            {profile.clinicAddress.address}
                                            <br />
                                            {profile.clinicAddress.city}, {profile.clinicAddress.state} - {profile.clinicAddress.pincode}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium mb-2 text-sm sm:text-base">Consultation Options</h4>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-primary" />
                                            <span className="text-xs sm:text-sm">Video Call</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-primary" />
                                            <span className="text-xs sm:text-sm">Chat</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl">Patient Reviews</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="text-center py-8">
                                    <Star className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-base sm:text-lg font-medium">No reviews yet</h3>
                                    <p className="text-muted-foreground text-xs sm:text-sm">Be the first to review this doctor.</p>
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
                        toast.success("Appointment booked successfully!")
                    }}
                />
            )}
        </div>
    )
}