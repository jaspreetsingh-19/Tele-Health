// models/VideoCall.js
import mongoose from "mongoose"

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userType: {
        type: String,
        enum: ["doctor", "patient"],
        required: true
    },
    joinedAt: {
        type: Date,
        default: null
    },
    leftAt: {
        type: Date,
        default: null
    },
    isConnected: {
        type: Boolean,
        default: false
    },
})

const videoCallSchema = new mongoose.Schema({
    callId: {
        type: String,
        required: true,
        unique: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
    roomId: {
        type: String,
        required: true // WebRTC room identifier
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    participants: [participantSchema],
    callStatus: {
        type: String,
        enum: ["initiated", "ringing", "connected", "ended", "failed", "missed"],
        default: "initiated"
    },

    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0
    },

    recordings: {
        isRecorded: {
            type: Boolean,
            default: false
        },
        recordingUrl: {
            type: String,
            default: null
        },
        recordingDuration: {
            type: Number,
            default: 0
        },
        patientConsent: {
            type: Boolean,
            default: false
        },
        doctorConsent: {
            type: Boolean,
            default: false
        }
    },
    chatMessages: [{
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        senderType: {
            type: String,
            enum: ["doctor", "patient"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },

}, {
    timestamps: true
})


const VideoCall = mongoose.models.VideoCall || mongoose.model("VideoCall", videoCallSchema)

export default VideoCall