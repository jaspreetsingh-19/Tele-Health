"use client"
import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, MapPin, Briefcase, Award, DollarSign, Clock, Star, Camera, Save, Edit3, Shield } from 'lucide-react';

const DoctorProfile = () => {
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
        doctorProfile: {
            doctorId: '',
            fullName: '',
            docPhoto: '',
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
        }
    });

    const [formData, setFormData] = useState({});
    const [newSpecialization, setNewSpecialization] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
            console.log("response is ", data)

            if (data.success) {
                const userData = data.user;
                // API returns 'profile' but we use 'doctorProfile' in the component
                const doctorProfile = userData.profile || userData.doctorProfile || {
                    doctorId: '',
                    fullName: '',
                    docPhoto: '',
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

                setProfileData({ ...userData, doctorProfile });
                setFormData({ ...userData, doctorProfile });
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
                    doctorProfile: {
                        ...prev.doctorProfile,
                        [nested]: {
                            ...prev.doctorProfile[nested],
                            [field]: value
                        }
                    }
                };
            } else {
                return {
                    ...prev,
                    doctorProfile: {
                        ...prev.doctorProfile,
                        [field]: value
                    }
                };
            }
        });
    };

    const addSpecialization = () => {
        if (newSpecialization.trim()) {
            setFormData(prev => ({
                ...prev,
                doctorProfile: {
                    ...prev.doctorProfile,
                    specialization: [...(prev.doctorProfile.specialization || []), newSpecialization.trim()]
                }
            }));
            setNewSpecialization('');
        }
    };

    const removeSpecialization = (index) => {
        setFormData(prev => ({
            ...prev,
            doctorProfile: {
                ...prev.doctorProfile,
                specialization: (prev.doctorProfile.specialization || []).filter((_, i) => i !== index)
            }
        }));
    };

    const toggleAvailableDay = (day) => {
        setFormData(prev => {
            const currentDays = prev.doctorProfile?.availableDays || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];

            return {
                ...prev,
                doctorProfile: {
                    ...prev.doctorProfile,
                    availableDays: newDays
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const updateData = {
                doctorProfile: formData.doctorProfile,
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
                setProfileData(data.user);
                setIsEditing(false);
            } else {
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
                                {profileData.doctorProfile?.docPhoto || profileData.avatar ? (
                                    <img
                                        src={profileData.doctorProfile?.docPhoto || profileData.avatar}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                {isEditing && (
                                    <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Dr. {profileData.doctorProfile?.fullName || profileData.username}
                                </h1>
                                <p className="text-gray-600">Doctor Profile</p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileData.isVerified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {profileData.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileData.doctorProfile?.isApproved
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {profileData.doctorProfile?.isApproved ? 'Approved' : 'Pending Approval'}
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
                    {/* Professional Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.doctorProfile?.fullName || ''}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.doctorProfile?.fullName || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newSpecialization}
                                                onChange={(e) => setNewSpecialization(e.target.value)}
                                                placeholder="Add specialization..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                                            />
                                            <button
                                                type="button"
                                                onClick={addSpecialization}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.doctorProfile?.specialization?.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {spec}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecialization(index)}
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
                                        {profileData.doctorProfile?.specialization?.length > 0 ? (
                                            profileData.doctorProfile.specialization.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {spec}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No specializations added</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.doctorProfile?.qualifications || ''}
                                        onChange={(e) => handleInputChange('qualifications', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., MBBS, MD, Fellowship..."
                                    />
                                ) : (
                                    <p className="text-gray-900 whitespace-pre-wrap">{profileData.doctorProfile?.qualifications || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.doctorProfile?.licenseNumber || ''}
                                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.doctorProfile?.licenseNumber || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.doctorProfile?.experienceYears || ''}
                                            onChange={(e) => handleInputChange('experienceYears', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.doctorProfile?.experienceYears || 0} years</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.doctorProfile?.consultationFee || ''}
                                            onChange={(e) => handleInputChange('consultationFee', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">₹{profileData.doctorProfile?.consultationFee || 0}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Clinic Address</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.doctorProfile?.clinicAddress?.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value, 'clinicAddress')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.doctorProfile?.clinicAddress?.address || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.doctorProfile?.clinicAddress?.city || ''}
                                            onChange={(e) => handleInputChange('city', e.target.value, 'clinicAddress')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.doctorProfile?.clinicAddress?.city || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.doctorProfile?.clinicAddress?.state || ''}
                                            onChange={(e) => handleInputChange('state', e.target.value, 'clinicAddress')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.doctorProfile?.clinicAddress?.state || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.doctorProfile?.clinicAddress?.pincode || ''}
                                            onChange={(e) => handleInputChange('pincode', e.target.value, 'clinicAddress')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.doctorProfile?.clinicAddress?.pincode || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.doctorProfile?.clinicAddress?.country || ''}
                                            onChange={(e) => handleInputChange('country', e.target.value, 'clinicAddress')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.doctorProfile?.clinicAddress?.country || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio & Availability */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Award className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Bio & Description</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.doctorProfile?.bio || ''}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Share your experience, expertise, and approach to patient care..."
                                    />
                                ) : (
                                    <p className="text-gray-900 whitespace-pre-wrap">{profileData.doctorProfile?.bio || 'No bio provided'}</p>
                                )}
                            </div>

                            {isEditing && (
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.doctorProfile?.isAvailableForConsultation || false}
                                            onChange={(e) => handleInputChange('isAvailableForConsultation', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Available for Consultation</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics & Availability */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Availability & Stats</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(formData.doctorProfile?.availableDays || []).includes(day)}
                                                    onChange={() => toggleAvailableDay(day)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.doctorProfile?.availableDays?.length > 0 ? (
                                            profileData.doctorProfile.availableDays.map((day, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                                >
                                                    {day}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No available days set</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1">
                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{profileData.doctorProfile?.rating?.toFixed(1) || '0.0'}</p>
                                        <p className="text-xs text-gray-600">Rating</p>
                                        <p className="text-xs text-gray-500">({profileData.doctorProfile?.totalRatings || 0} reviews)</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{profileData.doctorProfile?.totalConsultations || 0}</p>
                                        <p className="text-xs text-gray-600">Consultations</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1">
                                            <Shield className="w-5 h-5 text-green-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 mt-3">
                                            {profileData.doctorProfile?.isAvailableForConsultation ? 'Available' : 'Unavailable'}
                                        </p>
                                        <p className="text-xs text-gray-600">Status</p>
                                    </div>
                                </div>
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

export default DoctorProfile;