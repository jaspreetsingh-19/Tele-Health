import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inputText: { type: String, required: true }, // what patient typed/spoke
    aiResult: { type: String, required: true },  // JSON from Gemini
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Symptom || mongoose.model("Symptom", symptomSchema);
