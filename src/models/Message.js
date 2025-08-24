// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", },
        roomId: { type: String, required: true }, // convenience for socket room
        sender: { type: String },
        receiver: { type: String },

        type: { type: String, enum: ["text", "image", "file"], default: "text" },
        content: { type: String },             // text content
        fileUrl: { type: String },             // URL when image/file
        fileName: { type: String },            // original name
        fileMime: { type: String },            // mime type (e.g., application/pdf)

        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Message || mongoose.model("Message", messageSchema);
