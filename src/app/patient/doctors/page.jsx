"use client"

import { useState, useEffect } from "react"
import { Search, Star, MapPin, Clock, Video, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import axios from "axios"
import Link from "next/link"

export default function DoctorsListPage() {
    return (
        <DoctorsListContent />
    )
}

function DoctorsListContent() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSpecialization, setSelectedSpecialization] = useState("all")

    const specializations = [
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "General Medicine",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Pulmonology",
    ]

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchTerm) params.append("search", searchTerm)
            if (selectedSpecialization !== "all") params.append("specialization", selectedSpecialization)

            const response = await axios.get(`/api/doctors?${params}`)

            if (response.data.success) {
                setDoctors(response.data.doctors)
                if (response.data.doctors.length === 0) {
                    toast.info("No doctors found matching your criteria")
                }
            } else {
                toast.error("Failed to fetch doctors")
            }
        } catch (error) {
            toast.error("Failed to fetch doctors. Please try again.")
            console.error("Error fetching doctors:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDoctors()
    }, [searchTerm, selectedSpecialization])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchDoctors()
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Find Your Doctor</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Book appointments with qualified healthcare professionals
                    </p>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Search Doctors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                    <Input
                                        placeholder="Search by name or specialization..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select specialization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Specializations</SelectItem>
                                            {specializations.map((spec) => (
                                                <SelectItem key={spec} value={spec}>
                                                    {spec}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {loading ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-pulse text-muted-foreground">Loading doctors...</div>
                            </div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12 p-4 sm:p-6">
                                <div className="text-center">
                                    <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-base sm:text-lg font-medium">No doctors found</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        Try adjusting your search criteria.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {doctors.map((doctor) => (
                                <DoctorCard key={doctor._id} doctor={doctor} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function DoctorCard({ doctor }) {
    const profile = doctor.doctorProfile

    return (
        <Card className="hover:shadow-lg transition-shadow h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <div className="space-y-3 sm:space-y-4 flex-1">
                    {/* Doctor Info */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                            <AvatarImage src={profile.docPhoto || "/placeholder.svg"} alt={profile.fullName} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                                {profile.fullName?.charAt(0) || doctor.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{profile.fullName}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-accent text-accent flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium">{profile.rating || 0}</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    ({profile.totalRatings || 0} reviews)
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {profile.experienceYears} years experience
                            </p>
                        </div>
                    </div>

                    {/* Specializations */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                            {profile.specialization?.slice(0, 3).map((spec, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                </Badge>
                            ))}
                            {profile.specialization?.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{profile.specialization.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Qualifications */}
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                        {profile.qualifications}
                    </p>

                    {/* Location */}
                    {profile.clinicAddress && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                                {profile.clinicAddress.city}, {profile.clinicAddress.state}
                            </span>
                        </div>
                    )}

                    {/* Consultation Fee */}
                    <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm">
                            <span className="font-medium">Consultation Fee:</span>
                            <span className="ml-2 text-base sm:text-lg font-bold text-primary">
                                ₹{profile.consultationFee}
                            </span>
                        </div>
                    </div>

                    {/* Consultation Types */}
                    <div className="flex items-center gap-2">
                        <Video className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Video & Chat available</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                    <Link href={`/patient/doctors/${doctor._id}`} className="block">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3">
                            <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Book Appointment
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}