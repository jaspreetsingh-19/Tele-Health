import { createServer } from "http";
import { Server } from "socket.io";
import ChatRoom from "./src/models/ChatRoom.js";
import VideoCall from "./src/models/VideoCall.js";
import connectDB from "./src/lib/db.js";

const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// ✅ CREATE SIMPLE HTTP SERVER (removed Next.js)
const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
});

// Store room participants, typing status, video call sessions, and video messages
const roomParticipants = new Map();
const typingUsers = new Map();
const videoSessions = new Map();
const videoMessages = new Map();

io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // ============ CHAT HANDLERS ============
    socket.on("join-room", async ({ roomId, username, userId }) => {
        try {
            const chatRoom = await ChatRoom.findOne({ roomId }).populate([
                { path: "patientId", select: "_id username patientProfile avatar" },
                { path: "doctorId", select: "_id username doctorProfile avatar" },
            ]);

            if (!chatRoom) {
                console.error(`❌ Room ${roomId} not found`);
                socket.emit("error", { message: "Room not found" });
                return;
            }

            const patientId = chatRoom.patientId?._id?.toString();
            const doctorId = chatRoom.doctorId?._id?.toString();
            const hasAccess = patientId === userId || doctorId === userId;

            if (!hasAccess) {
                console.error(`❌ Access denied for user ${userId} to room ${roomId}`);
                socket.emit("error", { message: "Access denied to this room" });
                return;
            }

            socket.join(roomId);
            socket.username = username;
            socket.roomId = roomId;
            socket.userId = userId;

            if (!roomParticipants.has(roomId)) {
                roomParticipants.set(roomId, new Set());
            }
            roomParticipants.get(roomId).add({ socketId: socket.id, username, userId });

            console.log(`✅ ${username} joined room ${roomId}`);

            socket.to(roomId).emit("user-joined", {
                message: `${username} joined the consultation`,
                username,
                userId,
                timestamp: new Date().toISOString(),
            });

            const participantsCount = roomParticipants.get(roomId).size;
            io.to(roomId).emit("room-info", {
                participantsCount,
                roomId,
                participants: Array.from(roomParticipants.get(roomId)),
            });

            socket.emit("room-history", {
                messages: chatRoom.messages.slice(-50),
                roomInfo: {
                    patientId: chatRoom.patientId,
                    doctorId: chatRoom.doctorId,
                    appointmentId: chatRoom.appointmentId,
                    isActive: chatRoom.isActive,
                },
            });
        } catch (error) {
            console.error("❌ Error in join-room:", error);
            socket.emit("error", { message: "Failed to join room" });
        }
    });

    socket.on("sendMessage", async (payload) => {
        try {
            console.log("📨 Received message payload:", payload);

            if (!payload.roomId || !payload.content || !payload.sender || !payload.senderId) {
                console.error("❌ Invalid message payload:", payload);
                socket.emit("messageError", { error: "Invalid message data" });
                return;
            }

            const chatRoom = await ChatRoom.findOne({ roomId: payload.roomId });
            if (!chatRoom) {
                console.error("❌ Room not found:", payload.roomId);
                socket.emit("messageError", { error: "Room not found" });
                return;
            }

            const patientId = chatRoom.patientId?.toString();
            const doctorId = chatRoom.doctorId?.toString();
            const hasAccess = patientId === payload.senderId || doctorId === payload.senderId;

            if (!hasAccess) {
                console.error("❌ Message access denied for user:", payload.senderId);
                socket.emit("messageError", { error: "Access denied" });
                return;
            }

            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const messageData = {
                roomId: payload.roomId,
                sender: payload.sender,
                senderId: payload.senderId,
                senderRole: payload.senderRole,
                content: payload.content,
                type: payload.type || "text",
                timestamp: new Date().toISOString(),
                messageId,
                delivered: true,
            };

            const newMessage = {
                senderId: payload.senderId,
                senderType: payload.senderRole,
                message: payload.content,
                messageType: payload.type || "text",
                timestamp: new Date(),
                isRead: false,
                messageId,
            };

            if (payload.fileData) {
                newMessage.fileUrl = payload.fileData.url;
                newMessage.fileName = payload.fileData.name;
                newMessage.fileSize = payload.fileData.size;
                newMessage.fileType = payload.fileData.type;
                newMessage.cloudinaryPublicId = payload.fileData.publicId;
                messageData.fileData = payload.fileData;
            }

            chatRoom.messages.push(newMessage);
            chatRoom.updatedAt = new Date();
            await chatRoom.save();

            // Clear typing indicator
            if (typingUsers.has(payload.roomId)) {
                const roomTyping = typingUsers.get(payload.roomId);
                if (roomTyping.has(payload.senderId)) {
                    roomTyping.delete(payload.senderId);
                    socket.to(payload.roomId).emit("typing", {
                        roomId: payload.roomId,
                        userId: payload.senderId,
                        isTyping: false,
                        username: payload.sender,
                    });
                }
            }

            socket.to(payload.roomId).emit("receiveMessage", messageData);
            console.log(`✅ Message broadcast to room ${payload.roomId}`);
        } catch (error) {
            console.error("❌ sendMessage error:", error);
            socket.emit("messageError", {
                error: "Failed to send message",
                originalPayload: payload,
                errorDetails: error.message,
            });
        }
    });

    // ============ VIDEO CALL HANDLERS ============
    socket.on("join-video-call", async ({ callId, userId, username }) => {
        try {
            console.log(`📹 User ${username} (${userId}) joining video call ${callId}`);
            const videoCall = await VideoCall.findOne({ callId })
                .populate("patientId", "username avatar")
                .populate("doctorId", "username avatar");

            if (!videoCall) {
                socket.emit("video-error", { message: "Video call not found" });
                return;
            }

            const patientId = videoCall.patientId._id.toString();
            const doctorId = videoCall.doctorId._id.toString();
            const hasAccess = patientId === userId || doctorId === userId;

            if (!hasAccess) {
                socket.emit("video-error", { message: "Access denied to this video call" });
                return;
            }

            socket.join(callId);
            socket.callId = callId;
            socket.userId = userId;
            socket.username = username;

            if (!videoSessions.has(callId)) {
                videoSessions.set(callId, {
                    participants: new Map(),
                    offers: new Map(),
                    answers: new Map(),
                    iceCandidates: new Map(),
                });
            }

            // Initialize video messages for this call if not exists
            if (!videoMessages.has(callId)) {
                videoMessages.set(callId, []);
            }

            const session = videoSessions.get(callId);
            if (session.participants.has(userId)) {
                session.participants.set(userId, { socketId: socket.id, userId, username });
            } else {
                session.participants.set(userId, { socketId: socket.id, userId, username });
            }

            const existingParticipants = Array.from(session.participants.values()).filter(
                (p) => p.userId !== userId
            );

            // Update participant status in DB
            const participant = videoCall.participants.find((p) => p.userId.toString() === userId);
            if (participant) {
                participant.joinedAt = new Date();
                participant.isConnected = true;
            }

            const connectedCount = session.participants.size;
            if (connectedCount === 1) videoCall.callStatus = "ringing";
            else if (connectedCount === 2) {
                videoCall.callStatus = "connected";
                if (!videoCall.startTime) videoCall.startTime = new Date();
            }

            await videoCall.save();

            // Notify others
            existingParticipants.forEach((existingParticipant) => {
                io.to(existingParticipant.socketId).emit("user-joined-video", {
                    userId,
                    username,
                    callStatus: videoCall.callStatus,
                    participantCount: connectedCount,
                });
            });

            // Send video call history to the joining user
            const callMessages = videoMessages.get(callId) || [];
            socket.emit("video-call-joined", {
                callId,
                roomId: videoCall.roomId,
                callStatus: videoCall.callStatus,
                participantCount: connectedCount,
                otherParticipants: existingParticipants.map((p) => ({
                    userId: p.userId,
                    username: p.username,
                })),
                messages: callMessages.slice(-20),
            });

            if (connectedCount === 2 && existingParticipants.length === 1) {
                const otherParticipant = existingParticipants[0];
                io.to(otherParticipant.socketId).emit("initiate-webrtc", {
                    targetUserId: userId,
                    targetUsername: username,
                    role: "caller",
                });

                socket.emit("webrtc-ready", {
                    targetUserId: otherParticipant.userId,
                    targetUsername: otherParticipant.username,
                    role: "callee",
                });
            }
        } catch (error) {
            console.error("❌ Error joining video call:", error);
            socket.emit("video-error", { message: "Failed to join video call" });
        }
    });

    socket.on("sendVideoMessage", async (payload) => {
        try {
            console.log("📹💬 Received video message payload:", payload);

            const {
                callId,
                senderId,
                sender,
                senderName,
                senderRole,
                content,
                type,
                fileData,
            } = payload;

            const videoCall = await VideoCall.findOne({ callId });
            if (!videoCall) {
                socket.emit("videoMessageError", { error: "Video call not found" });
                return;
            }

            const patientId = videoCall.patientId?.toString();
            const doctorId = videoCall.doctorId?.toString();
            const hasAccess = patientId === senderId || doctorId === senderId;

            if (!hasAccess) {
                console.error("❌ Video message access denied for user:", senderId);
                socket.emit("videoMessageError", { error: "Access denied to this video call" });
                return;
            }

            const session = videoSessions.get(callId);
            if (!session || !session.participants.has(senderId)) {
                socket.emit("videoMessageError", { error: "You must be in the video call to send messages" });
                return;
            }

            const messageId = `vmsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const normalizedSender = sender || senderName || socket.username || "Unknown";
            const normalizedRole =
                senderRole || (senderId === patientId ? "patient" : "doctor");

            const messageData = {
                callId,
                senderId,
                sender: normalizedSender,
                senderRole: normalizedRole,
                content: content || "",
                type: type || "text",
                timestamp: new Date().toISOString(),
                messageId,
                delivered: true,
            };

            if (fileData) {
                messageData.fileData = {
                    url: fileData.url,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    publicId: fileData.publicId,
                };
            }

            if (!videoMessages.has(callId)) {
                videoMessages.set(callId, []);
            }
            videoMessages.get(callId).push(messageData);

            if (videoCall.messages) {
                const videoMessage = {
                    senderId,
                    senderType: normalizedRole,
                    message: content || "",
                    messageType: type || (fileData ? "file" : "text"),
                    timestamp: new Date(),
                    messageId,
                };

                if (fileData) {
                    videoMessage.fileUrl = fileData.url;
                    videoMessage.fileName = fileData.name;
                    videoMessage.fileSize = fileData.size;
                    videoMessage.fileType = fileData.type;
                    videoMessage.cloudinaryPublicId = fileData.publicId;
                }

                videoCall.messages.push(videoMessage);
                videoCall.updatedAt = new Date();
                await videoCall.save();
            }

            session.participants.forEach((participant) => {
                if (participant.userId !== senderId) {
                    io.to(participant.socketId).emit("receiveVideoMessage", messageData);
                }
            });

            socket.emit("videoMessageSent", {
                messageId,
                timestamp: messageData.timestamp,
                callId,
            });

            console.log(`✅ Video message sent in call ${callId} by ${senderId}`);
        } catch (error) {
            console.error("❌ sendVideoMessage error:", error);
            socket.emit("videoMessageError", {
                error: "Failed to send video message",
                originalPayload: payload,
                errorDetails: error.message,
            });
        }
    });

    // WebRTC signaling handlers
    socket.on("webrtc-offer", async ({ callId, offer, targetUserId }) => {
        try {
            if (socket.userId === targetUserId) return;

            const session = videoSessions.get(callId);
            if (!session) return;

            const targetParticipant = session.participants.get(targetUserId);
            if (targetParticipant) {
                session.offers.set(`${socket.userId}->${targetUserId}`, offer);
                io.to(targetParticipant.socketId).emit("webrtc-offer", {
                    callId,
                    offer,
                    fromUserId: socket.userId,
                    fromUsername: socket.username,
                });
            }
        } catch (error) {
            console.error("❌ Error handling WebRTC offer:", error);
        }
    });

    socket.on("webrtc-answer", async ({ callId, answer, targetUserId }) => {
        try {
            if (socket.userId === targetUserId) return;

            const session = videoSessions.get(callId);
            if (!session) return;

            const targetParticipant = session.participants.get(targetUserId);
            if (targetParticipant) {
                session.answers.set(`${socket.userId}->${targetUserId}`, answer);
                io.to(targetParticipant.socketId).emit("webrtc-answer", {
                    callId,
                    answer,
                    fromUserId: socket.userId,
                    fromUsername: socket.username,
                });
            }
        } catch (error) {
            console.error("❌ Error handling WebRTC answer:", error);
        }
    });

    socket.on("webrtc-ice-candidate", async ({ callId, candidate, targetUserId }) => {
        try {
            if (socket.userId === targetUserId) return;

            const session = videoSessions.get(callId);
            if (!session) return;

            const targetParticipant = session.participants.get(targetUserId);
            if (targetParticipant) {
                io.to(targetParticipant.socketId).emit("webrtc-ice-candidate", {
                    callId,
                    candidate,
                    fromUserId: socket.userId,
                });
            }
        } catch (error) {
            console.error("❌ Error handling ICE candidate:", error);
        }
    });

    socket.on("leave-video-call", async ({ callId }) => {
        try {
            await handleVideoCallDisconnect(socket, callId);
        } catch (error) {
            console.error("❌ Error leaving video call:", error);
        }
    });

    socket.on("videoTyping", async ({ callId, userId, isTyping }) => {
        try {
            const session = videoSessions.get(callId);
            if (!session || !session.participants.has(userId)) {
                return;
            }

            session.participants.forEach((participant) => {
                if (participant.userId !== userId) {
                    io.to(participant.socketId).emit("videoTyping", {
                        callId,
                        userId,
                        username: socket.username,
                        isTyping,
                    });
                }
            });
        } catch (error) {
            console.error("❌ Error in video typing handler:", error);
        }
    });

    socket.on("typing", async ({ roomId, userId, isTyping }) => {
        try {
            if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Map());
            const roomTyping = typingUsers.get(roomId);

            if (isTyping) roomTyping.set(userId, { username: socket.username, timestamp: Date.now() });
            else roomTyping.delete(userId);

            socket.to(roomId).emit("typing", {
                roomId,
                userId,
                isTyping,
                username: socket.username,
                typingUsers: Array.from(roomTyping.values()),
            });
        } catch (error) {
            console.error("❌ Error in typing handler:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        if (socket.callId) handleVideoCallDisconnect(socket, socket.callId);

        if (socket.roomId && roomParticipants.has(socket.roomId)) {
            const participants = roomParticipants.get(socket.roomId);
            const toRemove = Array.from(participants).find((p) => p.socketId === socket.id);
            if (toRemove) {
                participants.delete(toRemove);
                socket.to(socket.roomId).emit("user-left", {
                    message: `${socket.username} left the consultation`,
                    username: socket.username,
                    userId: socket.userId,
                    timestamp: new Date().toISOString(),
                });
                if (participants.size === 0) roomParticipants.delete(socket.roomId);
            }
        }
    });
});

// Handle video call disconnect
async function handleVideoCallDisconnect(socket, callId) {
    try {
        const session = videoSessions.get(callId);
        if (session && session.participants.has(socket.userId)) {
            session.participants.delete(socket.userId);
            socket.to(callId).emit("user-left-video", {
                userId: socket.userId,
                username: socket.username,
                participantCount: session.participants.size,
                timestamp: new Date().toISOString(),
            });

            const videoCall = await VideoCall.findOne({ callId });
            if (videoCall) {
                const dbParticipant = videoCall.participants.find(
                    (p) => p.userId.toString() === socket.userId
                );
                if (dbParticipant) {
                    dbParticipant.isConnected = false;
                    dbParticipant.leftAt = new Date();
                }

                const connectedParticipants = videoCall.participants.filter((p) => p.isConnected);
                if (connectedParticipants.length === 0) {
                    videoCall.callStatus = "ended";
                    videoCall.endTime = new Date();
                    if (videoCall.startTime)
                        videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000);

                    videoMessages.delete(callId);
                } else if (connectedParticipants.length === 1) {
                    videoCall.callStatus = "ringing";
                }

                await videoCall.save();
            }

            if (session.participants.size === 0) {
                videoSessions.delete(callId);
                videoMessages.delete(callId);
            }
        }

        socket.leave(callId);
    } catch (error) {
        console.error("❌ Error handling video call disconnect:", error);
    }
}

httpServer
    .once("error", (err) => {
        console.error("❌ Server error:", err);
        process.exit(1);
    })
    .listen(port, () => {
        console.log(`🚀 Socket.io server ready on port ${port}`);
        console.log("🔌 Socket.IO server initialized with WebRTC support");
    });