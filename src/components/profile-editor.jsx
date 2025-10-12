"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, X } from "lucide-react"

export default function ProfileEditor({ user, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        avatar: user.avatar || "",
        profile: user.profile || {},
    })
    const [loading, setLoading] = useState(false)

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            profile: {
                ...prev.profile,
                [field]: value,
            },
        }))
    }

    const handleAvatarChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            avatar: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios.put("/api/dashboard", formData)
            if (response.data.success) {
                toast.success("Profile updated successfully")
                onSave(response.data.user)
            } else {
                throw new Error("Update failed")
            }
        } catch (error) {
            toast.error("Failed to update profile")
            console.error("Profile update error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Edit Profile</h1>
                <Button variant="outline" onClick={onCancel} className="flex items-center gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={user.username} />
                                <AvatarFallback>{user.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="avatar">Avatar URL</Label>
                                <Input
                                    id="avatar"
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => handleAvatarChange(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{user.role === "doctor" ? "Professional Information" : "Personal Information"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.profile.firstName || ""}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.profile.lastName || ""}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        {user.role === "patient" && (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.profile.dateOfBirth ? formData.profile.dateOfBirth.split("T")[0] : ""}
                                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.profile.phone || ""}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.profile.address || ""}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        placeholder="Enter your address"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                                    <Input
                                        id="emergencyContact"
                                        value={formData.profile.emergencyContact || ""}
                                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                                        placeholder="Emergency contact name and phone"
                                    />
                                </div>
                            </>
                        )}

                        {user.role === "doctor" && (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="specialization">Specialization</Label>
                                        <Input
                                            id="specialization"
                                            value={formData.profile.specialization || ""}
                                            onChange={(e) => handleInputChange("specialization", e.target.value)}
                                            placeholder="e.g., Cardiology, Pediatrics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="licenseNumber">License Number</Label>
                                        <Input
                                            id="licenseNumber"
                                            value={formData.profile.licenseNumber || ""}
                                            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                                            placeholder="Medical license number"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Years of Experience</Label>
                                        <Input
                                            id="experience"
                                            type="number"
                                            min="0"
                                            value={formData.profile.experience || ""}
                                            onChange={(e) => handleInputChange("experience", Number.parseInt(e.target.value) || "")}
                                            placeholder="Years of experience"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hospital">Hospital/Clinic</Label>
                                        <Input
                                            id="hospital"
                                            value={formData.profile.hospital || ""}
                                            onChange={(e) => handleInputChange("hospital", e.target.value)}
                                            placeholder="Current workplace"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.profile.bio || ""}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                        placeholder="Brief description of your background and expertise"
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}