"use client"

import { useState, useEffect } from "react"
import { Search, Star, MapPin, Clock, Video, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { toast } from "@/hooks/use-toast"
import axios from "axios"
import Link from "next/link"
// import PatientDashboardLayout from "@/components/PatientDashboardLayout"

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
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch doctors",
                variant: "destructive",
            })
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
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Find Your Doctor</h1>
                <p className="text-muted-foreground">Book appointments with qualified healthcare professionals</p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Search Doctors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
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
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading doctors...</div>
                    </div>
                ) : doctors.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No doctors found</h3>
                                <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {doctors.map((doctor) => (
                            <DoctorCard key={doctor._id} doctor={doctor} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function DoctorCard({ doctor }) {
    const profile = doctor.doctorProfile

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Doctor Info */}
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={profile.fullName} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {profile.fullName?.charAt(0) || doctor.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-accent text-accent" />
                                <span className="text-sm font-medium">{profile.rating || 0}</span>
                                <span className="text-sm text-muted-foreground">({profile.totalRatings || 0} reviews)</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{profile.experienceYears} years experience</p>
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
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.qualifications}</p>

                    {/* Location */}
                    {profile.clinicAddress && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                                {profile.clinicAddress.city}, {profile.clinicAddress.state}
                            </span>
                        </div>
                    )}

                    {/* Consultation Fee */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <span className="font-medium">Consultation Fee:</span>
                            <span className="ml-2 text-lg font-bold text-primary">₹{profile.consultationFee}</span>
                        </div>
                    </div>

                    {/* Consultation Types */}
                    <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Video & Chat available</span>
                    </div>

                    {/* Action Button */}
                    <Link href={`/patient/doctors/${doctor._id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                            <Clock className="mr-2 h-4 w-4" />
                            Book Appointment
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
