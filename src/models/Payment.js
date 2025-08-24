import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, unique: true, required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "upi", "wallet"] },
    paymentGatewayId: { type: String },
    status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema)
