import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        appointmentId: {
            type: String,
            required: true
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            startTime: {
                type: String,
                required: true, // Format: "09:00"
            },
            endTime: {
                type: String,
                required: true, // Format: "09:30"
            },
        },
        consultationType: {
            type: String,
            enum: ["video", "chat"],
            required: true,
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "no-show"],
            default: "scheduled",
        },
        symptoms: {
            type: String,
            required: true,
        },
        consultationFee: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        roomId: {
            type: String,
            default: null, // Will be generated for video/chat sessions
        },
        prescription: {
            medicines: [
                {
                    name: String,
                    dosage: String,
                    frequency: String,
                    duration: String,
                    instructions: String,
                },
            ],
            advice: String,
            followUpDate: Date,
        },
        notes: {
            doctorNotes: String,
            patientNotes: String,
        },
    },
    { timestamps: true },
)

// Index for efficient queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 })
appointmentSchema.index({ patientId: 1, appointmentDate: 1 })

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema)

export default Appointment
