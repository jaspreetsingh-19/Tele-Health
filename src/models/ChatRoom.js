// models/ChatRoom.js
import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
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
    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
})

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        // required: true
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
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Update lastActivity when messages are added
chatRoomSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastActivity = new Date()
    }
    next()
})

// Index for efficient queries

chatRoomSchema.index({ appointmentId: 1 })
chatRoomSchema.index({ patientId: 1 })
chatRoomSchema.index({ doctorId: 1 })

const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema)

export default ChatRoom