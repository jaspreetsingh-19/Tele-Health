// models/User.js (Updated)
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "credentials"
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["patient", "admin", "doctor"],
        default: "patient",
    },
    lastLogin: {
        type: Date,
        default: null
    },
    authProvider: {
        type: String,
        enum: ["credentials", "google", "github"],
        default: "credentials"
    },
    avatar: {
        type: String,
        default: null
    },
    patientProfile: {
        patientId: String,
        fullName: String,
        dob: Date,
        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String
        },
        medicalHistory: String,
        allergies: [String],
        currentMedications: [String],
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        },
        bloodGroup: String,
        height: Number, // in cm
        weight: Number, // in kg
        isProfileComplete: {
            type: Boolean,
            default: false
        }
    },
    doctorProfile: {
        doctorId: String,
        fullName: String,
        docPhoto: String,
        specialization: [String], // Changed to array for multiple specializations
        qualifications: String,
        experienceYears: Number,
        consultationFee: Number,
        availableDays: [String],
        bio: String,

        clinicAddress: {
            address: String,
            city: String,
            state: String,
            pincode: String,
            country: String
        },
        licenseNumber: String,
        rating: {
            type: Number,
            default: 0
        },
        totalRatings: {
            type: Number,
            default: 0
        },
        totalConsultations: {
            type: Number,
            default: 0
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isAvailableForConsultation: {
            type: Boolean,
            default: true
        }
    },
    notifications: [{
        type: String,
        message: String,
        read: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verificationToken: String,
    verificationTokenExpiry: Date
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User