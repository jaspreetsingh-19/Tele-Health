"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function Chat() {
    const { socket, connected } = useSocket();
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);
    const [username, setUsername] = useState("");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [participantsCount, setParticipantsCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for incoming messages and events
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            console.log("📨 Received message:", msg);

            // Only add message if it's not already in the list (prevent duplicates)
            setMessages((prev) => {
                const isDuplicate = prev.some(existingMsg =>
                    existingMsg.messageId === msg.messageId ||
                    (existingMsg.sender === msg.sender &&
                        existingMsg.content === msg.content &&
                        Math.abs(new Date(existingMsg.timestamp) - new Date(msg.timestamp)) < 1000)
                );

                if (isDuplicate) {
                    return prev;
                }

                return [...prev, {
                    ...msg,
                    timestamp: msg.timestamp || new Date().toISOString()
                }];
            });
        };

        const handleUserJoined = (message) => {
            console.log("👋 User joined:", message);
            setMessages((prev) => [...prev, {
                type: "system",
                content: message,
                timestamp: new Date().toISOString()
            }]);
        };

        const handleUserLeft = (message) => {
            console.log("👋 User left:", message);
            setMessages((prev) => [...prev, {
                type: "system",
                content: message,
                timestamp: new Date().toISOString()
            }]);
        };

        const handleTyping = ({ userId, isTyping }) => {
            if (userId !== username) {
                setIsTyping(isTyping);
                setTypingUser(isTyping ? userId : null);

                // Clear typing indicator after 3 seconds
                if (isTyping) {
                    setTimeout(() => {
                        setIsTyping(false);
                        setTypingUser(null);
                    }, 3000);
                }
            }
        };

        const handleRoomInfo = ({ participantsCount: count, roomId: room }) => {
            setParticipantsCount(count);
            console.log(`👥 Room ${room} has ${count} participants`);
        };

        // Register event listeners
        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("user-joined", handleUserJoined);
        socket.on("user-left", handleUserLeft);
        socket.on("typing", handleTyping);
        socket.on("room-info", handleRoomInfo);

        return () => {
            // Cleanup event listeners
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("user-joined", handleUserJoined);
            socket.off("user-left", handleUserLeft);
            socket.off("typing", handleTyping);
            socket.off("room-info", handleRoomInfo);
        };
    }, [socket, username]);

    // Join room
    const handleJoin = () => {
        if (!roomId.trim() || !username.trim()) {
            alert("Please enter both room ID and username");
            return;
        }

        if (!socket || !connected) {
            alert("Not connected to server. Please wait...");
            return;
        }

        console.log(`🚪 Joining room ${roomId} as ${username}`);
        setJoined(true);
        socket.emit("join-room", { roomId: roomId.trim(), username: username.trim() });

        // Add welcome message
        setMessages([{
            type: "system",
            content: `Welcome to room ${roomId}! You are now connected.`,
            timestamp: new Date().toISOString()
        }]);
    };

    // Send message
    const sendMessage = () => {
        if (!input.trim() || !socket || !connected) return;

        const messageData = {
            roomId,
            sender: username,
            content: input.trim(),
            type: "text"
        };

        console.log("📤 Sending message:", messageData);
        socket.emit("sendMessage", messageData);
        setInput("");

        // Stop typing indicator
        socket.emit("typing", {
            roomId,
            userId: username,
            isTyping: false
        });
    };

    // Handle typing
    const handleInputChange = (e) => {
        setInput(e.target.value);

        if (socket && joined && connected) {
            socket.emit("typing", {
                roomId,
                userId: username,
                isTyping: e.target.value.trim().length > 0
            });
        }
    };

    // Handle enter key
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (!joined) {
        return (
            <div className="max-w-xl mx-auto p-4">
                <div className="flex flex-col gap-3 bg-gray-100 p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-center mb-4">Join Chat Room</h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="border px-3 py-2 rounded w-full"
                        />
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Room ID"
                            className="border px-3 py-2 rounded w-full"
                        />

                        <div className="text-center text-sm">
                            {connected ? (
                                <span className="text-green-600">🟢 Connected to server</span>
                            ) : (
                                <span className="text-red-600">🔴 Connecting...</span>
                            )}
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={!connected}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition w-full disabled:bg-gray-400"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center p-3 bg-gray-200 border-b">
                    <div>
                        <span className="font-bold">{username}</span>
                        <span className="text-sm text-gray-600 ml-2">Room: {roomId}</span>
                        <span className="text-sm text-gray-600 ml-2">({participantsCount} online)</span>
                    </div>
                    <span className="text-sm">
                        {connected ? "🟢 Connected" : "🔴 Disconnected"}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((msg, i) => (
                        <div key={`${msg.messageId || i}-${msg.timestamp}`}>
                            {msg.type === "system" ? (
                                <div className="text-center">
                                    <span className="text-xs text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">
                                        {msg.content}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className={`flex ${msg.sender === username ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${msg.sender === username
                                            ? "bg-blue-500 text-white ml-auto"
                                            : "bg-white text-gray-800 border"
                                            }`}
                                    >
                                        {msg.sender !== username && (
                                            <div className="text-xs font-semibold mb-1 text-blue-600">
                                                {msg.sender}
                                            </div>
                                        )}
                                        <div>{msg.content}</div>
                                        <div className={`text-xs mt-1 ${msg.sender === username ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && typingUser && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
                                <em>{typingUser} is typing...</em>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex p-3 gap-2 border-t bg-white">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!connected}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || !connected}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}