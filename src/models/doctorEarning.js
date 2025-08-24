const doctorEarningSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    doctorShare: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.DoctorEarning || mongoose.model("DoctorEarning", doctorEarningSchema)