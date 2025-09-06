"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    Search,
    Trash2,
    Users,
    UserCheck,
    Eye,
    Phone,
    MapPin,
    Calendar,
    Stethoscope,
    X,
    Plus,
    Star,
    Award,
    Clock,
    DollarSign,
    Globe
} from "lucide-react"
import axios from "axios"

interface DoctorProfile {
    doctorId?: string
    fullName?: string
    specialization?: string[]
    qualifications?: string
    experienceYears?: number
    consultationFee?: number
    availableDays?: string[]
    bio?: string
    // languages?: string[]
    clinicAddress?: {
        Address?: string
        city?: string
        state?: string
        pincode?: string
        country?: string
    }
    licenseNumber?: string,
    docPhoto?: string
    rating?: number
    totalRatings?: number
    totalConsultations?: number
    isApproved?: boolean
    isAvailableForConsultation?: boolean
}

interface Doctor {
    _id: string
    username: string
    email: string
    role: "patient" | "admin" | "doctor"
    isVerified: boolean
    createdAt: string
    lastLogin?: string | Date
    docPhoto?: string
    doctorProfile?: DoctorProfile
}

interface CreateDoctorForm {
    username: string
    email: string
    password: string
    fullName: string
    specialization: string[]
    qualifications: string
    experienceYears: number
    consultationFee: number
    availableDays: string[]
    bio: string
    // languages: string[]
    clinicAddress: {
        Address: string
        city: string
        state: string
        pincode: string
        country: string
    }
    licenseNumber: string,
    photos: string
}

const initialFormState: CreateDoctorForm = {
    username: "",
    email: "",
    password: "",
    fullName: "",
    specialization: [],
    qualifications: "",
    experienceYears: 0,
    consultationFee: 0,
    availableDays: [],
    bio: "",
    // languages: [],
    clinicAddress: {
        Address: "",
        city: "",
        state: "",
        pincode: "",
        country: ""
    },
    licenseNumber: "",
    photos: ""
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const commonLanguages = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Arabic", "Bengali"]
const commonSpecializations = [
    "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics",
    "Psychiatry", "Radiology", "Surgery", "Internal Medicine", "Gynecology",
    "Ophthalmology", "ENT", "Anesthesiology", "Emergency Medicine"
]

export default function DoctorManagementPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])

    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
    const [profileDialogOpen, setProfileDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)
    const [createForm, setCreateForm] = useState<CreateDoctorForm>(initialFormState)
    const [createLoading, setCreateLoading] = useState(false)
    const [newSpecialization, setNewSpecialization] = useState("")
    const [newLanguage, setNewLanguage] = useState("")
    const [photoFile, setPhotoFile] = useState<File | null>(null)

    // Fetch doctors
    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/admin/doctors")
            if (response) {

                const data = await response.data
                console.log("doc dtaa is ",)
                setDoctors(data || [])

            }
        } catch (error) {
            console.error("Error fetching doctors:", error)
        } finally {
            setLoading(false)
        }
    }

    // Delete doctor
    const handleDeleteDoctor = async (userId: string) => {
        try {
            setActionLoading(userId)
            const response = await axios.delete("/api/admin/doctors", { data: { userId } })

            if (response) {
                setDoctors(doctors.filter((doctor) => doctor._id !== userId))
            }
        } catch (error) {
            console.error("Error deleting doctor:", error)
        } finally {
            setActionLoading(null)
            setDeleteDialogOpen(false)
            setDoctorToDelete(null)
        }
    }

    // Create doctor
    const handleCreateDoctor = async (e: any) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            let photoUrl = "";

            // 1. Upload to Cloudinary if file exists
            if (photoFile) {
                const formData = new FormData();
                formData.append("file", photoFile);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: "POST", body: formData }
                );

                const data = await res.json();
                photoUrl = data.secure_url; // <-- get hosted image URL
            }

            // 2. Final payload
            const payload = {
                ...createForm,
                photos: photoUrl
            };

            // 3. Call your backend API
            setCreateLoading(true)
            const response = await axios.post("/api/admin/doctors", payload)

            if (response) {
                await fetchDoctors()
                setCreateDialogOpen(false)
                setCreateForm(initialFormState)
            }

            alert("Doctor created successfully!");

            // Reset form
            setCreateForm({
                username: "",
                email: "",
                password: "",
                fullName: "",
                specialization: [],
                qualifications: "",
                experienceYears: 0,
                consultationFee: 0,
                licenseNumber: "",
                bio: "",
                availableDays: [],
                clinicAddress: {
                    Address: "",
                    city: "",
                    state: "",
                    pincode: "",
                    country: ""
                },
                photos: "",
                // languages: []
            });
            setPhotoFile(null);
            setCreateDialogOpen(false);

        } catch (err) {
            console.error(err);
            alert("Error creating doctor");
        } finally {
            setCreateLoading(false);
        }
    };


    const handleViewProfile = (doctor: Doctor) => {
        setSelectedDoctor(doctor)
        setProfileDialogOpen(true)
    }

    const openDeleteDialog = (doctor: Doctor) => {
        setDoctorToDelete(doctor)
        setDeleteDialogOpen(true)
    }

    const addSpecialization = () => {
        if (newSpecialization.trim() && !createForm.specialization.includes(newSpecialization.trim())) {
            setCreateForm(prev => ({
                ...prev,
                specialization: [...prev.specialization, newSpecialization.trim()]
            }))
            setNewSpecialization("")
        }
    }

    const removeSpecialization = (spec: string) => {
        setCreateForm(prev => ({
            ...prev,
            specialization: prev.specialization.filter(s => s !== spec)
        }))
    }




    const toggleDay = (day: string) => {
        setCreateForm(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }))
    }

    // Filter doctors based on search term
    const filteredDoctors = doctors.filter(
        (doctor) =>
            doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doctor.doctorProfile?.fullName &&
                doctor.doctorProfile.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (doctor.doctorProfile?.specialization &&
                doctor.doctorProfile.specialization.some(spec =>
                    spec.toLowerCase().includes(searchTerm.toLowerCase())
                ))
    )

    useEffect(() => {
        fetchDoctors()
    }, [])

    const totalDoctors = doctors.length

    const approvedDoctors = doctors.filter((doctor) => doctor.doctorProfile?.isApproved).length

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Doctor Management</h1>
                    <p className="text-gray-600">Manage doctor accounts and profiles</p>
                </div>
                <button
                    onClick={() => setCreateDialogOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Doctor
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                            <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
                        </div>
                        <Users className="h-8 w-8 text-gray-400" />
                    </div>
                </div>


                <div className="bg-white rounded-lg border border-gray-200 p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Approved Doctors</p>
                            <p className="text-2xl font-bold text-gray-900">{approvedDoctors}</p>
                        </div>
                        <Stethoscope className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={fetchDoctors}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Doctors</h2>
                    <p className="text-sm text-gray-600">A list of all registered doctors</p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <table className="w-full min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specialization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDoctors.map((doctor) => (
                                    <tr key={doctor._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    {doctor.doctorProfile?.docPhoto ? (
                                                        <img
                                                            src={doctor.doctorProfile?.docPhoto}
                                                            alt={doctor.username}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {(doctor.doctorProfile?.fullName || doctor.username)
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {doctor.doctorProfile?.fullName || doctor.username}
                                                    </div>
                                                    {doctor.doctorProfile?.doctorId && (
                                                        <div className="text-sm text-gray-500 truncate">
                                                            ID: {doctor.doctorProfile.doctorId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="truncate max-w-xs">{doctor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="max-w-xs">
                                                {doctor.doctorProfile?.specialization?.length ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {doctor.doctorProfile.specialization.slice(0, 2).map((spec, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                        {doctor.doctorProfile.specialization.length > 2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{doctor.doctorProfile.specialization.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "Not specified"
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doctor.doctorProfile?.experienceYears
                                                ? `${doctor.doctorProfile.experienceYears} years`
                                                : "Not specified"
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doctor.doctorProfile?.rating ? (
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span>{doctor.doctorProfile.rating.toFixed(1)}</span>
                                                    <span className="text-gray-500 ml-1">
                                                        ({doctor.doctorProfile.totalRatings})
                                                    </span>
                                                </div>
                                            ) : (
                                                "No ratings"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${doctor.doctorProfile?.isApproved
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {doctor.doctorProfile?.isApproved ? "Approved" : "Pending"}
                                                </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${doctor.isVerified
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {doctor.isVerified ? "Verified" : "Unverified"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewProfile(doctor)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">View</span>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(doctor)}
                                                    disabled={actionLoading === doctor._id}
                                                    className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                                >
                                                    {actionLoading === doctor._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && filteredDoctors.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No doctors found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Doctor Dialog */}
            {createDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Create New Doctor</h2>
                                <p className="text-gray-600">Add a new doctor to the system</p>
                            </div>
                            <button
                                onClick={() => setCreateDialogOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDoctor} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.username}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.fullName}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPhotoFile(e.target.files[0]);
                                            } else {
                                                setPhotoFile(null);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {photoFile && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Selected: {photoFile.name}
                                        </p>
                                    )}
                                    {createForm.photos && (
                                        <img
                                            src={createForm.photos}
                                            alt="Preview"
                                            className="mt-2 w-24 h-24 object-cover rounded-full border"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>

                                {/* Specializations */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations *</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {createForm.specialization.map((spec, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                                            >
                                                {spec}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecialization(spec)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={newSpecialization}
                                            onChange={(e) => setNewSpecialization(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select specialization</option>
                                            {commonSpecializations.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addSpecialization}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                                        <input
                                            type="text"
                                            value={createForm.qualifications}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, qualifications: e.target.value }))}
                                            placeholder="e.g., MBBS, MD"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={createForm.experienceYears}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={createForm.consultationFee}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                                        <input
                                            type="text"
                                            value={createForm.licenseNumber}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        rows={3}
                                        value={createForm.bio}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Brief description about the doctor..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Available Days */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${createForm.availableDays.includes(day)
                                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                            </div>

                            {/* Clinic Address */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Clinic Address</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <input
                                            type="text"
                                            value={createForm.clinicAddress.Address}
                                            onChange={(e) => setCreateForm(prev => ({
                                                ...prev,
                                                clinicAddress: { ...prev.clinicAddress, Address: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={createForm.clinicAddress.city}
                                            onChange={(e) => setCreateForm(prev => ({
                                                ...prev,
                                                clinicAddress: { ...prev.clinicAddress, city: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            value={createForm.clinicAddress.state}
                                            onChange={(e) => setCreateForm(prev => ({
                                                ...prev,
                                                clinicAddress: { ...prev.clinicAddress, state: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            value={createForm.clinicAddress.pincode}
                                            onChange={(e) => setCreateForm(prev => ({
                                                ...prev,
                                                clinicAddress: { ...prev.clinicAddress, pincode: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={createForm.clinicAddress.country}
                                            onChange={(e) => setCreateForm(prev => ({
                                                ...prev,
                                                clinicAddress: { ...prev.clinicAddress, country: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setCreateDialogOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center"
                                >
                                    {createLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Doctor"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && doctorToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
                        <p className="text-gray-600 mb-4">
                            This action cannot be undone. This will permanently delete the doctor account for{" "}
                            {doctorToDelete.doctorProfile?.fullName || doctorToDelete.username} ({doctorToDelete.email}).
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setDeleteDialogOpen(false)
                                    setDoctorToDelete(null)
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteDoctor(doctorToDelete._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                                Delete Doctor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Doctor Profile Dialog */}
            {profileDialogOpen && selectedDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Doctor Profile</h2>
                                <p className="text-gray-600">
                                    Detailed information for {selectedDoctor.doctorProfile?.fullName || selectedDoctor.username}
                                </p>
                            </div>
                            <button
                                onClick={() => setProfileDialogOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                {selectedDoctor.docPhoto ? (
                                                    <img
                                                        src={selectedDoctor.docPhoto}
                                                        alt={selectedDoctor.username}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {(selectedDoctor.doctorProfile?.fullName || selectedDoctor.username)
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {selectedDoctor.doctorProfile?.fullName || selectedDoctor.username}
                                                </p>
                                                <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
                                            </div>
                                        </div>

                                        {selectedDoctor.doctorProfile?.doctorId && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Doctor ID:</span>
                                                <span className="text-gray-900">{selectedDoctor.doctorProfile.doctorId}</span>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.licenseNumber && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">License Number:</span>
                                                <span className="text-gray-900">{selectedDoctor.doctorProfile.licenseNumber}</span>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.experienceYears !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-700 flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    Experience:
                                                </span>
                                                <span className="text-gray-900">{selectedDoctor.doctorProfile.experienceYears} years</span>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.consultationFee !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-700 flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    Consultation Fee:
                                                </span>
                                                <span className="text-gray-900">₹{selectedDoctor.doctorProfile.consultationFee}</span>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.rating !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-700 flex items-center">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    Rating:
                                                </span>
                                                <span className="text-gray-900">
                                                    {selectedDoctor.doctorProfile.rating.toFixed(1)}
                                                    ({selectedDoctor.doctorProfile.totalRatings} reviews)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                                    <div className="space-y-3">
                                        {selectedDoctor.doctorProfile?.specialization && selectedDoctor.doctorProfile.specialization.length > 0 && (
                                            <div>
                                                <p className="font-medium text-gray-700 mb-2">Specializations:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDoctor.doctorProfile.specialization.map((spec, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.qualifications && (
                                            <div>
                                                <p className="font-medium text-gray-700 mb-1">Qualifications:</p>
                                                <p className="text-sm text-gray-900">{selectedDoctor.doctorProfile.qualifications}</p>
                                            </div>
                                        )}

                                        {/* {selectedDoctor.doctorProfile?.languages && selectedDoctor.doctorProfile.languages.length > 0 && (
                                            <div>
                                                <p className="font-medium text-gray-700 mb-2 flex items-center">
                                                    <Globe className="h-4 w-4 mr-1" />
                                                    Languages:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDoctor.doctorProfile.languages.map((lang, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                                        >
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )} */}

                                        {selectedDoctor.doctorProfile?.availableDays && selectedDoctor.doctorProfile.availableDays.length > 0 && (
                                            <div>
                                                <p className="font-medium text-gray-700 mb-2 flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Available Days:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDoctor.doctorProfile.availableDays.map((day, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                                        >
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.doctorProfile?.totalConsultations !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Total Consultations:</span>
                                                <span className="text-gray-900">{selectedDoctor.doctorProfile.totalConsultations}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio and Clinic Address */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {selectedDoctor.doctorProfile?.bio && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                                        <p className="text-sm text-gray-900">{selectedDoctor.doctorProfile.bio}</p>
                                    </div>
                                )}

                                {selectedDoctor.doctorProfile?.clinicAddress && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Address</h3>
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div className="text-sm text-gray-900">
                                                {selectedDoctor.doctorProfile.clinicAddress.Address && (
                                                    <div>{selectedDoctor.doctorProfile.clinicAddress.Address}</div>
                                                )}
                                                <div>
                                                    {[
                                                        selectedDoctor.doctorProfile.clinicAddress.city,
                                                        selectedDoctor.doctorProfile.clinicAddress.state,
                                                        selectedDoctor.doctorProfile.clinicAddress.pincode
                                                    ].filter(Boolean).join(", ")}
                                                </div>
                                                {selectedDoctor.doctorProfile.clinicAddress.country && (
                                                    <div>{selectedDoctor.doctorProfile.clinicAddress.country}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex justify-between sm:flex-col sm:items-start">
                                        <span className="font-medium text-gray-700">Registration Date:</span>
                                        <span className="text-gray-900 text-sm">{new Date(selectedDoctor.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between sm:flex-col sm:items-start">
                                        <span className="font-medium text-gray-700">Last Login:</span>
                                        <span className="text-gray-900 text-sm">
                                            {selectedDoctor.lastLogin
                                                ? new Date(selectedDoctor.lastLogin).toLocaleDateString()
                                                : "Never"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between sm:flex-col sm:items-start">
                                        <span className="font-medium text-gray-700">Approval Status:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedDoctor.doctorProfile?.isApproved
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {selectedDoctor.doctorProfile?.isApproved ? "Approved" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}