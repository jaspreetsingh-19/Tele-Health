"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Mail, MapPin, Heart, Pill, AlertTriangle, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PatientProfile() {
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPatientData()
    }, [])

    const fetchPatientData = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/dashboard")
            console.log("resp", response.data.user.profile)
            setPatient(response.data.user.profile)

        } catch (err) {
            setError("Failed to load patient data")
            console.error("Error fetching patient data:", err)
        } finally {
            setLoading(false)
        }
    }
    console.log("data set", patient)

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading patient profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="text-center p-6">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={fetchPatientData}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Patient Profile</h1>
                        <p className="text-muted-foreground">Comprehensive medical information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-1">
                        <Card className="border-l-4 border-l-accent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-accent" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{patient?.name || "John Doe"}</h3>
                                    <p className="text-muted-foreground">Patient ID: {patient?.patientId || "P001"}</p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Age: {patient?.age || "35"} years</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Gender: {patient?.gender || "Male"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{patient?.phone || "+1 (555) 123-4567"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{patient?.email || "john.doe@email.com"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-sm">{patient?.address || "123 Main St, City, State 12345"}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">Emergency Contact</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {patient?.emergencyContact?.name || "Jane Doe"}
                                        <br />
                                        {patient?.emergencyContact?.phone || "+1 (555) 987-6543"}
                                        <br />
                                        {patient?.emergencyContact?.relationship || "Spouse"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Medical Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vital Signs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Vital Signs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-foreground">{patient?.vitals?.bloodPressure || "120/80"}</p>
                                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-foreground">{patient?.vitals?.heartRate || "72"}</p>
                                        <p className="text-sm text-muted-foreground">Heart Rate</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-foreground">{patient?.vitals?.temperature || "98.6°F"}</p>
                                        <p className="text-sm text-muted-foreground">Temperature</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-foreground">{patient?.vitals?.weight || "170 lbs"}</p>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Allergies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    Allergies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {patient?.allergies?.length > 0 ? (
                                        patient.allergies.map((allergy, index) => (
                                            <Badge key={index} variant="destructive">
                                                {allergy}
                                            </Badge>
                                        ))
                                    ) : (
                                        <>
                                            <Badge variant="destructive">Penicillin</Badge>
                                            <Badge variant="destructive">Shellfish</Badge>
                                            <Badge variant="destructive">Latex</Badge>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Medications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-blue-500" />
                                    Current Medications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {patient?.medications?.length > 0 ? (
                                        patient.medications.map((med, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                <div>
                                                    <p className="font-medium">{med.name}</p>
                                                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                                </div>
                                                <Badge variant="outline">{med.frequency}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                <div>
                                                    <p className="font-medium">Lisinopril</p>
                                                    <p className="text-sm text-muted-foreground">10mg</p>
                                                </div>
                                                <Badge variant="outline">Daily</Badge>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                <div>
                                                    <p className="font-medium">Metformin</p>
                                                    <p className="text-sm text-muted-foreground">500mg</p>
                                                </div>
                                                <Badge variant="outline">Twice Daily</Badge>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medical History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Medical History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {patient?.medicalHistory?.length > 0 ? (
                                        patient.medicalHistory.map((condition, index) => (
                                            <div key={index} className="p-3 bg-muted rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{condition.condition}</p>
                                                        <p className="text-sm text-muted-foreground">{condition.description}</p>
                                                    </div>
                                                    <Badge variant="secondary">{condition.year}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">Hypertension</p>
                                                        <p className="text-sm text-muted-foreground">Diagnosed and managed with medication</p>
                                                    </div>
                                                    <Badge variant="secondary">2020</Badge>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">Type 2 Diabetes</p>
                                                        <p className="text-sm text-muted-foreground">Well controlled with diet and medication</p>
                                                    </div>
                                                    <Badge variant="secondary">2018</Badge>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
