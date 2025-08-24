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
  Heart,
  X
} from "lucide-react"
import axios from "axios"

interface PatientProfile {
  patientId?: string
  fullName?: string
  dob?: Date
  gender?: "male" | "female" | "other"
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  medicalHistory?: string
  allergies?: string[]
  currentMedications?: string[]
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  bloodGroup?: string
  height?: number
  weight?: number
  isProfileComplete?: boolean
}

interface Patient {
  _id: string
  username: string
  email: string
  role: "patient" | "admin" | "doctor"
  isVerified: boolean
  createdAt: string
  lastLogin?: string | Date
  avatar?: string
  patientProfile?: PatientProfile
}

export default function PatientManagementPage() {
  const [patients, setPatients] = useState<Patient[]>([
    // Mock data for demonstration
    {
      _id: "1",
      username: "john_doe",
      email: "john.doe@example.com",
      role: "patient",
      isVerified: true,
      createdAt: "2024-01-15T10:00:00Z",
      lastLogin: "2024-08-10T14:30:00Z",
      avatar: "",
      patientProfile: {
        patientId: "P001",
        fullName: "John Doe",
        dob: new Date("1990-05-15"),
        gender: "male",
        phone: "+1-555-0123",
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          pincode: "10001",
          country: "USA"
        },
        medicalHistory: "No significant medical history",
        allergies: ["Penicillin", "Peanuts"],
        currentMedications: ["Vitamin D", "Multivitamin"],
        emergencyContact: {
          name: "Jane Doe",
          phone: "+1-555-0124",
          relationship: "Spouse"
        },
        bloodGroup: "O+",
        height: 175,
        weight: 70,
        isProfileComplete: true
      }
    },
    {
      _id: "2",
      username: "alice_smith",
      email: "alice.smith@example.com",
      role: "patient",
      isVerified: false,
      createdAt: "2024-02-20T08:15:00Z",
      lastLogin: "2024-08-11T09:45:00Z",
      avatar: "",
      patientProfile: {
        patientId: "P002",
        fullName: "Alice Smith",
        dob: new Date("1985-12-03"),
        gender: "female",
        phone: "+1-555-0125",
        bloodGroup: "A-",
        isProfileComplete: false
      }
    }
  ])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)

  console.log("starting to fetch")
  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true)

      const response = await axios.get("/api/admin/patients")
      console.log("fetched")
      console.log("resposne is", response)
      if (response) {
        const data = await response.data
        setPatients(data || [])
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  // Delete patient
  const handleDeletePatient = async (userId: string) => {
    try {
      setActionLoading(userId)
      const response = await axios.delete("/api/admin/patients", { data: { userId } });


      if (response) {
        setPatients(patients.filter((patient) => patient._id !== userId))
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
    } finally {
      setActionLoading(null)
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
    }
  }

  const handleViewProfile = (patient: Patient) => {
    setSelectedPatient(patient)
    setProfileDialogOpen(true)
  }

  const openDeleteDialog = (patient: Patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patientProfile?.fullName &&
        patient.patientProfile.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  useEffect(() => {
    fetchPatients()
  }, [])

  const totalPatients = patients.length
  const verifiedPatients = patients.filter((patient) => patient.isVerified).length
  const completeProfiles = patients.filter((patient) => patient.patientProfile?.isProfileComplete).length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient accounts and profiles</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Patients</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedPatients}</p>
            </div>
            <UserCheck className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
              <p className="text-2xl font-bold text-gray-900">{completeProfiles}</p>
            </div>
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchPatients}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
          <p className="text-sm text-gray-600">A list of all registered patients</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {patient.avatar ? (
                            <img
                              src={patient.avatar}
                              alt={patient.username}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {(patient.patientProfile?.fullName || patient.username)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.patientProfile?.fullName || patient.username}
                          </div>
                          {patient.patientProfile?.patientId && (
                            <div className="text-sm text-gray-500">
                              ID: {patient.patientProfile.patientId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.patientProfile?.phone ||
                        patient.patientProfile?.emergencyContact?.phone ||
                        "Not provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.patientProfile?.isProfileComplete
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {patient.patientProfile?.isProfileComplete ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {patient.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.createdAt).toLocaleDateString("en-us")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.lastLogin ? new Date(patient.lastLogin).toLocaleDateString("en-us") : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewProfile(patient)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </button>
                        <button
                          onClick={() => openDeleteDialog(patient)}
                          disabled={actionLoading === patient._id}
                          className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {actionLoading === patient._id ? (
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

          {!loading && filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the patient account for{" "}
              {patientToDelete.patientProfile?.fullName || patientToDelete.username} ({patientToDelete.email}).
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setPatientToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(patientToDelete._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Profile Dialog */}
      {profileDialogOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Patient Profile</h2>
                <p className="text-gray-600">
                  Detailed information for {selectedPatient.patientProfile?.fullName || selectedPatient.username}
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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {selectedPatient.avatar ? (
                          <img
                            src={selectedPatient.avatar}
                            alt={selectedPatient.username}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {(selectedPatient.patientProfile?.fullName || selectedPatient.username)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedPatient.patientProfile?.fullName || selectedPatient.username}
                        </p>
                        <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                      </div>
                    </div>

                    {selectedPatient.patientProfile?.patientId && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Patient ID:</span>
                        <span className="text-gray-900">{selectedPatient.patientProfile.patientId}</span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.dob && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Date of Birth:
                        </span>
                        <span className="text-gray-900">
                          {new Date(selectedPatient.patientProfile.dob).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.gender && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Gender:</span>
                        <span className="text-gray-900 capitalize">{selectedPatient.patientProfile.gender}</span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.bloodGroup && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Blood Group:</span>
                        <span className="text-gray-900">{selectedPatient.patientProfile.bloodGroup}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedPatient.patientProfile?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{selectedPatient.patientProfile.phone}</span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-900">
                          {selectedPatient.patientProfile.address.street && (
                            <div>{selectedPatient.patientProfile.address.street}</div>
                          )}
                          <div>
                            {[
                              selectedPatient.patientProfile.address.city,
                              selectedPatient.patientProfile.address.state,
                              selectedPatient.patientProfile.address.pincode
                            ].filter(Boolean).join(", ")}
                          </div>
                          {selectedPatient.patientProfile.address.country && (
                            <div>{selectedPatient.patientProfile.address.country}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.emergencyContact && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Emergency Contact:</p>
                        <div className="text-sm space-y-1 pl-4">
                          <div className="text-gray-900">{selectedPatient.patientProfile.emergencyContact.name}</div>
                          <div className="text-gray-900">{selectedPatient.patientProfile.emergencyContact.phone}</div>
                          <div className="text-gray-600">
                            {selectedPatient.patientProfile.emergencyContact.relationship}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Information</h3>
                  <div className="space-y-3">
                    {selectedPatient.patientProfile?.height && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Height:</span>
                        <span className="text-gray-900">{selectedPatient.patientProfile.height} cm</span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.weight && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Weight:</span>
                        <span className="text-gray-900">{selectedPatient.patientProfile.weight} kg</span>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.height && selectedPatient.patientProfile?.weight && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">BMI:</span>
                        <span className="text-gray-900">
                          {(selectedPatient.patientProfile.weight /
                            Math.pow(selectedPatient.patientProfile.height / 100, 2)).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                  <div className="space-y-3">
                    {selectedPatient.patientProfile?.medicalHistory && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Medical History:</p>
                        <p className="text-sm text-gray-900">{selectedPatient.patientProfile.medicalHistory}</p>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.allergies && selectedPatient.patientProfile.allergies.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Allergies:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.patientProfile.allergies.map((allergy, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPatient.patientProfile?.currentMedications && selectedPatient.patientProfile.currentMedications.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Current Medications:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.patientProfile.currentMedications.map((medication, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {medication}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Registration Date:</span>
                    <span className="text-gray-900">{new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Last Login:</span>
                    <span className="text-gray-900">
                      {selectedPatient.lastLogin
                        ? new Date(selectedPatient.lastLogin).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Verification Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedPatient.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}>
                      {selectedPatient.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Profile Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedPatient.patientProfile?.isProfileComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {selectedPatient.patientProfile?.isProfileComplete ? "Complete" : "Incomplete"}
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