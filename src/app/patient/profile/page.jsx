"use client"
import { useState, useEffect } from 'react';
import { User, Edit2, Calendar, Phone, MapPin, Heart, AlertCircle, Save, X } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Set up axios defaults to include cookies
    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/api/dashboard');
            if (response.data.success) {
                setUser(response.data.user);
                setEditForm(response.data.user.profile || {});
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Handle authentication error
            if (error.response?.status === 401) {
                router.push("/auth/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await axios.put('/api/dashboard', {
                profile: editForm
            });

            if (response.data.success) {
                setUser(response.data.user);
                setIsEditing(false);
                // Show success message
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-xl">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Unable to load profile</p>
                    <button
                        onClick={fetchUserProfile}
                        className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const profile = user?.profile || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                        <User className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {profile.fullName || user?.username}</h1>
                        <p className="text-muted-foreground">Manage your profile information</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${isEditing
                            ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                >
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
            </div>

            {/* Profile Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center border-b border-border pb-3">
                        <User className="mr-2" size={24} />
                        Personal Information
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.fullName || ''}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.fullName || 'Not provided'}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editForm.dob ? new Date(editForm.dob).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('dob', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg flex items-center">
                                        <Calendar className="mr-2 text-muted-foreground" size={16} />
                                        {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Gender</label>
                                {isEditing ? (
                                    <select
                                        value={editForm.gender || ''}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg capitalize">{profile.gender || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editForm.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg flex items-center">
                                    <Phone className="mr-2 text-muted-foreground" size={16} />
                                    {profile.phone || 'Not provided'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center border-b border-border pb-3">
                        <Heart className="mr-2" size={24} />
                        Medical Information
                    </h2>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Blood Group</label>
                                {isEditing ? (
                                    <select
                                        value={editForm.bloodGroup || ''}
                                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
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
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.bloodGroup || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editForm.height || ''}
                                        onChange={(e) => handleInputChange('height', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.height ? `${profile.height} cm` : 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editForm.weight || ''}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.weight ? `${profile.weight} kg` : 'Not provided'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Allergies</label>
                            {isEditing ? (
                                <textarea
                                    value={editForm.allergies?.join(', ') || ''}
                                    onChange={(e) => handleInputChange('allergies', e.target.value.split(', ').filter(Boolean))}
                                    placeholder="Enter allergies separated by commas"
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    rows={3}
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg flex items-start">
                                    <AlertCircle className="mr-2 text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                                    {profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None listed'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center border-b border-border pb-3">
                        <MapPin className="mr-2" size={24} />
                        Address Information
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Street Address</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.address?.street || ''}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.address?.street || 'Not provided'}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">City</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.address?.city || ''}
                                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.address?.city || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">State</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.address?.state || ''}
                                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.address?.state || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Pincode</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.address?.pincode || ''}
                                        onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.address?.pincode || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Country</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.address?.country || ''}
                                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                    />
                                ) : (
                                    <p className="p-3 bg-muted/30 rounded-lg">{profile.address?.country || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center border-b border-border pb-3">
                        <AlertCircle className="mr-2" size={24} />
                        Emergency Contact
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.emergencyContact?.name || ''}
                                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.emergencyContact?.name || 'Not provided'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editForm.emergencyContact?.phone || ''}
                                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.emergencyContact?.phone || 'Not provided'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Relationship</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.emergencyContact?.relationship || ''}
                                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-muted/30 rounded-lg">{profile.emergencyContact?.relationship || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="flex justify-end">
                    <button
                        onClick={handleUpdateProfile}
                        className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        <Save size={20} />
                        <span>Save Changes</span>
                    </button>
                </div>
            )}
        </div>
    );
}