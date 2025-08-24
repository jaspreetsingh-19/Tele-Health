import mongoose from "mongoose"

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true, // Format: "09:00"
    },
    endTime: {
        type: String,
        required: true, // Format: "09:30"
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
    },
})

const availabilitySchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        timeSlots: [timeSlotSchema],
        breakTime: {
            startTime: String, // Format: "13:00"
            endTime: String, // Format: "14:00"
        },
    },
    { timestamps: true },
)

// Compound index for efficient queries
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true })

const DoctorAvailability =
    mongoose.models.DoctorAvailability || mongoose.model("DoctorAvailability", availabilitySchema)

export default DoctorAvailability
