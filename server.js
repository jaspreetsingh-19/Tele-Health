// server.js - Updated version
import { createServer } from 'http'
import next from 'next';
import { Server } from 'socket.io';
import ChatRoom from "./src/models/ChatRoom.js"
import connect from "./src/lib/db.js"

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()
connect()

app.prepare().then(() => {
    const httpServer = createServer(handler)

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

    // Store room participants and typing status
    const roomParticipants = new Map();
    const typingUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on("join-room", async ({ roomId, username }) => {
            socket.join(roomId);

            // Store user info
            socket.username = username;
            socket.roomId = roomId;

            // Add to room participants
            if (!roomParticipants.has(roomId)) {
                roomParticipants.set(roomId, new Set());
            }
            roomParticipants.get(roomId).add({ socketId: socket.id, username });

            console.log(`➡️ ${username} (${socket.id}) joined room ${roomId}`);

            // Notify others in the room
            socket.to(roomId).emit("user-joined", {
                message: `${username} joined the consultation`,
                username,
                timestamp: new Date().toISOString()
            });

            // Send current participants count to the room
            const participantsCount = roomParticipants.get(roomId).size;
            io.to(roomId).emit("room-info", {
                participantsCount,
                roomId,
                participants: Array.from(roomParticipants.get(roomId))
            });

            // Send room history/initial data
            try {
                const chatRoom = await ChatRoom.findOne({ roomId });
                if (chatRoom) {
                    socket.emit("room-history", {
                        messages: chatRoom.messages.slice(-50), // Last 50 messages
                        roomInfo: {
                            patientId: chatRoom.patientId,
                            doctorId: chatRoom.doctorId,
                            appointmentId: chatRoom.appointmentId
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching room history:", error);
            }
        });

        // Enhanced typing indication
        socket.on("typing", ({ roomId, userId, isTyping }) => {
            if (!typingUsers.has(roomId)) {
                typingUsers.set(roomId, new Map());
            }

            const roomTyping = typingUsers.get(roomId);

            if (isTyping) {
                roomTyping.set(userId, {
                    username: socket.username,
                    timestamp: Date.now()
                });
            } else {
                roomTyping.delete(userId);
            }

            // Broadcast typing status to others in room
            socket.to(roomId).emit("typing", {
                userId,
                isTyping,
                username: socket.username,
                typingUsers: Array.from(roomTyping.values())
            });

            // Auto-clear typing after 3 seconds of inactivity
            setTimeout(() => {
                const currentTime = Date.now();
                const roomTyping = typingUsers.get(roomId);
                if (roomTyping && roomTyping.has(userId)) {
                    const typingInfo = roomTyping.get(userId);
                    if (currentTime - typingInfo.timestamp > 3000) {
                        roomTyping.delete(userId);
                        socket.to(roomId).emit("typing", {
                            userId,
                            isTyping: false,
                            username: socket.username,
                            typingUsers: Array.from(roomTyping.values())
                        });
                    }
                }
            }, 3000);
        });

        socket.on("sendMessage", async (payload) => {
            try {
                console.log("Received message payload:", payload);

                // Enhanced message validation
                if (!payload.roomId || !payload.content || !payload.sender) {
                    console.error("❌ Invalid message payload:", payload);
                    return;
                }

                // Create comprehensive message object
                const messageData = {
                    roomId: payload.roomId,
                    sender: payload.sender,
                    senderId: payload.senderId,
                    senderRole: payload.senderRole,
                    content: payload.content,
                    type: payload.type || "text",
                    timestamp: new Date().toISOString(),
                    messageId: Math.random().toString(36).substring(7),
                    delivered: true
                };

                // Save message to database with enhanced error handling
                try {
                    const chatRoom = await ChatRoom.findOne({ roomId: payload.roomId });
                    if (chatRoom) {
                        const newMessage = {
                            senderId: payload.senderId,
                            senderType: payload.senderRole,
                            message: payload.content,
                            messageType: payload.type || 'text',
                            timestamp: new Date(),
                            isRead: false
                        };

                        chatRoom.messages.push(newMessage);
                        await chatRoom.save();

                        // Update message with actual DB ID
                        messageData.dbId = newMessage._id;

                        console.log("✅ Message saved to database");
                    } else {
                        console.warn("⚠️ Chat room not found, message sent but not saved");
                    }
                } catch (dbError) {
                    console.error("❌ Database save error:", dbError);
                    // Still send message even if DB save fails
                    messageData.dbError = true;
                }

                // Clear typing indicator for sender
                if (typingUsers.has(payload.roomId)) {
                    const roomTyping = typingUsers.get(payload.roomId);
                    if (roomTyping.has(payload.senderId)) {
                        roomTyping.delete(payload.senderId);
                        socket.to(payload.roomId).emit("typing", {
                            userId: payload.senderId,
                            isTyping: false,
                            username: payload.sender
                        });
                    }
                }

                // Send message to ALL users in the room (including sender for confirmation)
                io.to(payload.roomId).emit("receiveMessage", messageData);
                console.log(`✅ Message sent to room ${payload.roomId}: ${payload.content.substring(0, 50)}...`);

            } catch (e) {
                console.error("❌ sendMessage error:", e);

                // Send error back to sender
                socket.emit("messageError", {
                    error: "Failed to send message",
                    originalPayload: payload
                });
            }
        });

        // Handle message read receipts
        socket.on("markMessageRead", async ({ roomId, messageId, userId }) => {
            try {
                const chatRoom = await ChatRoom.findOne({ roomId });
                if (chatRoom) {
                    const message = chatRoom.messages.id(messageId);
                    if (message && !message.isRead) {
                        message.isRead = true;
                        await chatRoom.save();

                        // Notify sender that message was read
                        socket.to(roomId).emit("messageRead", {
                            messageId,
                            readBy: userId,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        });

        // Handle consultation status changes
        socket.on("consultationUpdate", ({ roomId, status, updatedBy }) => {
            socket.to(roomId).emit("consultationStatusChanged", {
                status,
                updatedBy,
                timestamp: new Date().toISOString()
            });
        });

        // Handle file/image sharing
        socket.on("shareFile", async (payload) => {
            try {
                const messageData = {
                    ...payload,
                    timestamp: new Date().toISOString(),
                    messageId: Math.random().toString(36).substring(7)
                };

                // Save file message to database
                const chatRoom = await ChatRoom.findOne({ roomId: payload.roomId });
                if (chatRoom) {
                    const newMessage = {
                        senderId: payload.senderId,
                        senderType: payload.senderRole,
                        message: payload.fileName || "File shared",
                        messageType: payload.fileType || 'file',
                        timestamp: new Date(),
                        isRead: false
                    };

                    chatRoom.messages.push(newMessage);
                    await chatRoom.save();
                }

                io.to(payload.roomId).emit("fileShared", messageData);
            } catch (error) {
                console.error("Error sharing file:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            // Clean up room participants
            if (socket.roomId && roomParticipants.has(socket.roomId)) {
                const participants = roomParticipants.get(socket.roomId);
                participants.forEach(participant => {
                    if (participant.socketId === socket.id) {
                        participants.delete(participant);

                        // Notify others that user left
                        socket.to(socket.roomId).emit("user-left", {
                            message: `${socket.username} left the consultation`,
                            username: socket.username,
                            timestamp: new Date().toISOString()
                        });

                        // Update participants count
                        const participantsCount = participants.size;
                        if (participantsCount > 0) {
                            socket.to(socket.roomId).emit("room-info", {
                                participantsCount,
                                roomId: socket.roomId
                            });
                        }

                        // Clean up empty rooms
                        if (participants.size === 0) {
                            roomParticipants.delete(socket.roomId);
                            if (typingUsers.has(socket.roomId)) {
                                typingUsers.delete(socket.roomId);
                            }
                        }
                    }
                });
            }

            // Clean up typing indicators
            if (socket.roomId && typingUsers.has(socket.roomId)) {
                const roomTyping = typingUsers.get(socket.roomId);
                roomTyping.forEach((typingInfo, userId) => {
                    if (typingInfo.username === socket.username) {
                        roomTyping.delete(userId);
                        socket.to(socket.roomId).emit("typing", {
                            userId,
                            isTyping: false,
                            username: socket.username
                        });
                    }
                });
            }
        });

        // Heartbeat to keep connection alive
        socket.on("ping", () => {
            socket.emit("pong");
        });

        // Error handling
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
            console.log('> Socket.IO server initialized')
        })
})