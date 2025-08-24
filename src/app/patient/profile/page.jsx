"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, MapPin, Calendar, FileText, Stethoscope } from 'lucide-react';
import axios from "axios"
import { useRouter } from 'next/navigation';

export default function PatientProfile() {
    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        phoneNumber: '',
        address: '',
        medicalHistory: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter()

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {

            const response = await axios.patch("http://localhost:3000/api/profile/patient", formData)
            console.log("response", response)

            console.log('Patient Profile Data:', formData);
            alert('Patient profile created successfully!');
            router.push("/patient")
            setIsSubmitting(false);
        } catch (error) {
            console.log("error in profile patirnt ui", error)

        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                        <Stethoscope className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Patient Profile</h1>
                    <p className="text-muted-foreground">Please complete your information for your telehealth record</p>
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Basic personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="fullName">
                                    Full Name *
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className={errors.fullName ? 'border-destructive' : ''}
                                />
                                {errors.fullName && (
                                    <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="gender">
                                        Gender *
                                    </Label>
                                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                        <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-destructive text-sm mt-1">{errors.gender}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth">
                                        Date of Birth *
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className={`pl-10 ${errors.dateOfBirth ? 'border-destructive' : ''}`}
                                        />
                                    </div>
                                    {errors.dateOfBirth && (
                                        <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="phoneNumber">
                                    Phone Number *
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="address">
                                    Address *
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="address"
                                        placeholder="Enter your complete address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        rows={3}
                                        className={`pl-10 resize-none ${errors.address ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-destructive text-sm mt-1">{errors.address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Medical History
                            </CardTitle>
                            <CardDescription>
                                Please provide relevant medical information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="medicalHistory">
                                    Medical History
                                </Label>
                                <Textarea
                                    id="medicalHistory"
                                    placeholder="Please describe any medical conditions, allergies, medications, or previous surgeries..."
                                    value={formData.medicalHistory}
                                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                    rows={5}
                                    className="resize-none"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Include allergies, current medications, chronic conditions, and family history
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            size="lg"
                            className="w-full max-w-md"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-background border-t-foreground rounded-full animate-spin"></div>
                                    Creating Profile...
                                </div>
                            ) : (
                                'Create Patient Profile'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-muted-foreground">
                        Your information is secure and protected under HIPAA compliance
                    </p>
                </div>
            </div>
        </div>
    );
}