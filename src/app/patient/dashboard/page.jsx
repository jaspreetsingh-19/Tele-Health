"use client"
import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, MapPin, Heart, Activity, AlertCircle, Contact, Save, Edit3, Camera } from 'lucide-react';

const PatientProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        _id: '',
        username: '',
        email: '',
        role: '',
        avatar: '',
        isVerified: false,
        lastLogin: null,
        authProvider: '',
        profile: {
            patientId: '',
            patientPhoto: '',
            fullName: '',
            dob: '',
            gender: '',
            phone: '',
            address: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: ''
            },
            medicalHistory: '',
            allergies: [],
            currentMedications: [],
            emergencyContact: {
                name: '',
                phone: '',
                relationship: ''
            },
            bloodGroup: '',
            height: '',
            weight: '',
            isProfileComplete: false
        }
    });

    const [formData, setFormData] = useState({});
    const [newAllergy, setNewAllergy] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const fileRef = React.useRef(null);


    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log(data)

            if (data.success) {
                const userData = data.user;
                // API returns 'profile' but we use 'doctorProfile' in the component
                const patientProfile = userData.profile || userData.patientProfile || {
                    PatientId: '',
                    fullName: '',
                    patientPhoto: '',
                    specialization: [],
                    qualifications: '',
                    experienceYears: 0,
                    consultationFee: 0,
                    availableDays: [],
                    bio: '',
                    clinicAddress: {
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        country: ''
                    },
                    licenseNumber: '',
                    rating: 0,
                    totalRatings: 0,
                    totalConsultations: 0,
                    isApproved: false,
                    isAvailableForConsultation: true
                };

                setProfileData({ ...userData, patientProfile });
                setFormData({ ...userData, patientProfile });
            }

        } catch (error) {
            console.error('Error fetching profile:', error);

        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value, nested = null) => {
        setFormData(prev => {
            if (nested) {
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        [nested]: {
                            ...prev.profile[nested],
                            [field]: value
                        }
                    }
                };
            } else if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        [parent]: {
                            ...prev.profile[parent],
                            [child]: value
                        }
                    }
                };
            } else {
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        [field]: value
                    }
                };
            }
        });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await res.json();
            if (data.success) {
                // Update the formData state so the UI shows the new image immediately
                setFormData(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        patientPhoto: data.file.url
                    }
                }));

                // Optionally update profileData as well to keep in sync
                setProfileData(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        patientPhoto: data.file.url
                    }
                }));
            } else {
                console.error("Upload failed:", data.error);
            }
        } catch (err) {
            console.error("Error uploading photo:", err);
        }
    };



    const addAllergy = () => {
        if (newAllergy.trim()) {
            setFormData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    allergies: [...(prev.profile.allergies || []), newAllergy.trim()]
                }
            }));
            setNewAllergy('');
        }
    };

    const removeAllergy = (index) => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                allergies: (prev.profile.allergies || []).filter((_, i) => i !== index)
            }
        }));
    };

    const addMedication = () => {
        if (newMedication.trim()) {
            setFormData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    currentMedications: [...(prev.profile.currentMedications || []), newMedication.trim()]
                }
            }));
            setNewMedication('');
        }
    };

    const removeMedication = (index) => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                currentMedications: (prev.profile.currentMedications || []).filter((_, i) => i !== index)
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const updateData = {
                profile: formData.profile,
                avatar: formData.avatar
            };

            const response = await fetch('/api/dashboard', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (data.success) {
                setProfileData(prev => ({
                    ...prev,
                    profile: data.user.profile // ✅ update nested profile
                }));
                setFormData(prev => ({
                    ...prev,
                    profile: data.user.profile
                }));
                setIsEditing(false);
            }
            else {
                throw new Error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);

        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profileData);
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                {profileData.profile?.patientPhoto ? (
                                    <img
                                        src={profileData.profile.patientPhoto}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    ref={fileRef}
                                    onChange={handlePhotoUpload}
                                />

                                {isEditing && (
                                    <button
                                        onClick={() => fileRef.current.click()}
                                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                )}

                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {profileData.profile?.fullName || profileData.username}
                                </h1>
                                <p className="text-gray-600">Patient Profile</p>
                                <div className="flex items-center mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileData.isVerified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {profileData.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.profile?.fullName || ''}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.fullName || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={formData.profile?.dob ? formData.profile.dob.split('T')[0] : ''}
                                            onChange={(e) => handleInputChange('dob', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{formatDate(profileData.profile?.dob) || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.profile?.gender || ''}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="text-gray-900 capitalize">{profileData.profile?.gender || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.profile?.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.profile?.height || ''}
                                            onChange={(e) => handleInputChange('height', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.height ? `${profileData.profile.height} cm` : 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.profile?.weight || ''}
                                            onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.weight ? `${profileData.profile.weight} kg` : 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                {isEditing ? (
                                    <select
                                        value={formData.profile?.bloodGroup || ''}
                                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.bloodGroup || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Contact & Address</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.profile?.address?.street || ''}
                                        onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.address?.street || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.profile?.address?.city || ''}
                                            onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.address?.city || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.profile?.address?.state || ''}
                                            onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.address?.state || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.profile?.address?.pincode || ''}
                                            onChange={(e) => handleInputChange('pincode', e.target.value, 'address')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.address?.pincode || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.profile?.address?.country || ''}
                                            onChange={(e) => handleInputChange('country', e.target.value, 'address')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.profile?.address?.country || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Contact className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.profile?.emergencyContact?.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value, 'emergencyContact')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.emergencyContact?.name || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.profile?.emergencyContact?.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value, 'emergencyContact')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.emergencyContact?.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.profile?.emergencyContact?.relationship || ''}
                                        onChange={(e) => handleInputChange('relationship', e.target.value, 'emergencyContact')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Spouse, Parent, Sibling"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.profile?.emergencyContact?.relationship || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Heart className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Medical Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.profile?.medicalHistory || ''}
                                        onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe any significant medical history..."
                                    />
                                ) : (
                                    <p className="text-gray-900 whitespace-pre-wrap">{profileData.profile?.medicalHistory || 'No medical history recorded'}</p>
                                )}
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newAllergy}
                                                onChange={(e) => setNewAllergy(e.target.value)}
                                                placeholder="Add allergy..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                                            />
                                            <button
                                                type="button"
                                                onClick={addAllergy}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.profile?.allergies?.map((allergy, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                                >
                                                    {allergy}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAllergy(index)}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.profile?.allergies?.length > 0 ? (
                                            profileData.profile.allergies.map((allergy, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                                >
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {allergy}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No allergies recorded</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Current Medications */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newMedication}
                                                onChange={(e) => setNewMedication(e.target.value)}
                                                placeholder="Add medication..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                                            />
                                            <button
                                                type="button"
                                                onClick={addMedication}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.profile?.currentMedications?.map((medication, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {medication}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedication(index)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.profile?.currentMedications?.length > 0 ? (
                                            profileData.profile.currentMedications.map((medication, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    <Activity className="w-4 h-4 mr-1" />
                                                    {medication}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No current medications recorded</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;