import React, { useEffect, useRef, useState } from 'react';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    MessageSquare,
    X,
    Send,
    AlertCircle,
    Wifi,
    WifiOff,
    Minimize2,
    Maximize2,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const server_url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

const rtcConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};

// ─── Time window check ───────────────────────────────────────────────────────
// Returns { allowed: bool, minutesUntilStart: number, minutesPastEnd: number }
function getCallTimeStatus(timeSlot) {
    if (!timeSlot) return { allowed: true };

    try {
        // timeSlot expected: { date: "2024-01-15", startTime: "12:30", endTime: "13:00" }
        // OR startTime could be a full ISO string
        const now = new Date();

        let start, end;

        if (timeSlot.startTime && timeSlot.date) {
            const dateStr = typeof timeSlot.date === 'string'
                ? timeSlot.date.split('T')[0]
                : new Date(timeSlot.date).toISOString().split('T')[0];

            start = new Date(`${dateStr}T${timeSlot.startTime}:00`);
            // end = start + 30 min if no endTime
            if (timeSlot.endTime) {
                end = new Date(`${dateStr}T${timeSlot.endTime}:00`);
            } else {
                end = new Date(start.getTime() + 30 * 60 * 1000);
            }
        } else if (timeSlot.startTime) {
            // Maybe it's already a full date string
            start = new Date(timeSlot.startTime);
            end = timeSlot.endTime
                ? new Date(timeSlot.endTime)
                : new Date(start.getTime() + 30 * 60 * 1000);
        } else {
            return { allowed: true };
        }

        // Allow joining 5 min early
        const windowStart = new Date(start.getTime() - 5 * 60 * 1000);
        // Block 30 min after scheduled end
        const windowEnd = new Date(end.getTime() + 30 * 60 * 1000);

        if (now < windowStart) {
            const minutesUntil = Math.ceil((windowStart - now) / 60000);
            return { allowed: false, reason: 'early', minutesUntilStart: minutesUntil, startTime: start };
        }

        if (now > windowEnd) {
            const minutesPast = Math.floor((now - windowEnd) / 60000);
            return { allowed: false, reason: 'expired', minutesPastEnd: minutesPast, endTime: end };
        }

        return { allowed: true };
    } catch (e) {
        console.error('Error parsing timeSlot:', e);
        return { allowed: true }; // fail open
    }
}

export default function TelehealthVideoCall({
    callId,
    userId,
    roomId,
    username,
    userType,
    patientInfo,
    doctorInfo,
    timeSlot,           // pass this from parent
    onCallEnd = () => console.log("Call ended")
}) {
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const isInitiatorRef = useRef(false);
    const targetUserIdRef = useRef(null);
    const pendingCandidatesRef = useRef([]);
    const makingOfferRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [callStatus, setCallStatus] = useState('connecting');
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [callDuration, setCallDuration] = useState(0);
    const [connectionQuality, setConnectionQuality] = useState('good');
    const [isTyping, setIsTyping] = useState(false);
    const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false);
    const [timeStatus, setTimeStatus] = useState(() => getCallTimeStatus(timeSlot));

    const otherUser = userType === 'patient' ? doctorInfo : patientInfo;

    // Re-check time every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeStatus(getCallTimeStatus(timeSlot));
        }, 30000);
        return () => clearInterval(interval);
    }, [timeSlot]);

    // Block if time expired while in call
    useEffect(() => {
        if (!timeStatus.allowed && timeStatus.reason === 'expired' && callStatus === 'connected') {
            toast.error('Appointment time has ended. Call will be disconnected.');
            setTimeout(() => endCall(), 3000);
        }
    }, [timeStatus]);

    // Initialize call
    useEffect(() => {
        initializeCall();
        return () => cleanup();
    }, []);

    // Call duration timer
    useEffect(() => {
        let interval;
        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const initializeCall = async () => {
        try {
            console.log('[INIT] Starting telehealth call initialization');
            toast.loading('Initializing video call...', { id: 'init-call' });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            toast.success('Camera and microphone ready', { id: 'init-call' });

            const socket = io(server_url, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            socketRef.current = socket;
            setupSocketListeners(socket);

            socket.on('connect', () => {
                console.log('[SOCKET] Connected to server, socket ID:', socket.id);
                toast.success('Connected to call server');
                setIsConnected(true);
                socket.emit('join-video-call', { callId, userId, username });
            });

            socket.on('connect_error', (error) => {
                console.error('[SOCKET] Connection error:', error);
                toast.error('Failed to connect to call server.');
                setCallStatus('failed');
            });

            socket.on('disconnect', (reason) => {
                console.log('[SOCKET] Disconnected:', reason);
                setIsConnected(false);
                if (reason === 'io server disconnect') socket.connect();
            });

        } catch (error) {
            console.error('[INIT] Failed to initialize call:', error);
            toast.error('Failed to access camera or microphone');
            setCallStatus('failed');
        }
    };

    const setupSocketListeners = (socket) => {
        socket.on('video-call-joined', ({ callId: joinedCallId, callStatus: status, participantCount, otherParticipants, messages: historyMessages }) => {
            setCallStatus(status === 'connected' ? 'connected' : 'ringing');
            if (historyMessages?.length > 0) {
                setMessages(historyMessages.map(msg => ({
                    id: msg.messageId || msg.timestamp?.toString() || Date.now().toString(),
                    content: msg.content, sender: msg.sender, senderId: msg.senderId,
                    senderRole: msg.senderRole,
                    timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString(),
                    isOwn: msg.senderId === userId,
                })));
            }
            if (otherParticipants?.length > 0) targetUserIdRef.current = otherParticipants[0].userId;
        });

        socket.on('user-joined-video', ({ userId: joinedUserId, username: joinedUsername, callStatus: status }) => {
            toast.success(`${joinedUsername} joined the call`);
            setCallStatus(status === 'connected' ? 'connected' : 'ringing');
            targetUserIdRef.current = joinedUserId;
        });

        socket.on('initiate-webrtc', ({ targetUserId, targetUsername, role }) => {
            targetUserIdRef.current = targetUserId;
            isInitiatorRef.current = (role === 'caller');
            if (isInitiatorRef.current) setTimeout(() => makeOffer(targetUserId), 500);
        });

        socket.on('webrtc-ready', ({ targetUserId, role }) => {
            targetUserIdRef.current = targetUserId;
            isInitiatorRef.current = (role === 'caller');
        });

        socket.on('webrtc-offer', async ({ offer, fromUserId }) => { await handleOffer(offer, fromUserId); });
        socket.on('webrtc-answer', async ({ answer }) => { await handleAnswer(answer); });
        socket.on('webrtc-ice-candidate', async ({ candidate }) => { await handleRemoteIceCandidate(candidate); });

        socket.on('user-left-video', ({ username: leftUsername, participantCount }) => {
            toast.info(`${leftUsername} left the call`);
            setCallStatus(participantCount === 0 ? 'ended' : 'ringing');
        });

        socket.on('receiveVideoMessage', (messageData) => {
            if (messageData.senderId !== userId) {
                setMessages(prev => [...prev, {
                    id: messageData.messageId || Date.now().toString(),
                    content: messageData.content, sender: messageData.sender,
                    senderId: messageData.senderId, senderRole: messageData.senderRole,
                    timestamp: new Date(messageData.timestamp || Date.now()).toLocaleTimeString(),
                    isOwn: false,
                }]);
                toast.success('New message received');
            }
        });

        socket.on('videoTyping', ({ userId: typingUserId, isTyping: typing }) => {
            if (typingUserId !== userId) setIsTyping(typing);
        });

        socket.on('video-error', ({ message }) => {
            toast.error(message);
            setCallStatus('failed');
        });

        socket.on('videoMessageError', () => toast.error('Failed to send message'));
    };

    const makeOffer = async (targetUserId) => {
        const pc = createPeerConnection();
        targetUserIdRef.current = targetUserId;
        makingOfferRef.current = true;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit('webrtc-offer', { callId, offer, targetUserId });
        } catch (error) {
            console.error('[RTC] Error making offer:', error);
            toast.error('Failed to establish connection');
        } finally {
            makingOfferRef.current = false;
        }
    };

    const createPeerConnection = () => {
        if (pcRef.current) return pcRef.current;
        const pc = new RTCPeerConnection(rtcConfiguration);
        pcRef.current = pc;

        localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
                setCallStatus('connected');
                toast.success('Video connection established');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserIdRef.current && socketRef.current) {
                socketRef.current.emit('webrtc-ice-candidate', {
                    callId, candidate: event.candidate.toJSON(), targetUserId: targetUserIdRef.current,
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            switch (pc.iceConnectionState) {
                case 'connected': case 'completed':
                    setConnectionQuality('good'); setCallStatus('connected'); break;
                case 'disconnected': setConnectionQuality('fair'); break;
                case 'failed': setConnectionQuality('poor'); break;
            }
        };

        return pc;
    };

    const handleOffer = async (offer, fromUserId) => {
        const pc = createPeerConnection();
        targetUserIdRef.current = fromUserId;
        try {
            if (pc.signalingState === 'have-local-offer') {
                if (userId > fromUserId) return;
                await pc.setLocalDescription({ type: 'rollback' });
            }
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit('webrtc-answer', { callId, answer, targetUserId: fromUserId });
            await flushPendingCandidates();
        } catch (error) {
            console.error('[RTC] Error handling offer:', error);
        }
    };

    const handleAnswer = async (answer) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await flushPendingCandidates();
            }
        } catch (error) {
            console.error('[RTC] Error handling answer:', error);
        }
    };

    const handleRemoteIceCandidate = async (candidate) => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) {
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidate));
            return;
        }
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (error) { console.error('[RTC] Error adding ICE candidate:', error); }
    };

    const flushPendingCandidates = async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;
        const candidates = pendingCandidatesRef.current.splice(0);
        for (const candidate of candidates) {
            try { await pc.addIceCandidate(candidate); } catch (e) { }
        }
    };

    const toggleVideo = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setVideo(track.enabled); }
    };

    const toggleAudio = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setAudio(track.enabled); }
    };

    const endCall = () => {
        socketRef.current?.emit('leave-video-call', { callId });
        cleanup();
        toast.success('Call ended');
        onCallEnd?.();
    };

    const cleanup = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
        pendingCandidatesRef.current = [];
        targetUserIdRef.current = null;
        isInitiatorRef.current = false;
        if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
        setCallStatus('ended');
        setIsConnected(false);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return;
        const message = {
            id: Date.now().toString(), content: newMessage, sender: username,
            senderId: userId, senderRole: userType,
            timestamp: new Date().toLocaleTimeString(), isOwn: true,
        };
        setMessages(prev => [...prev, message]);
        socketRef.current.emit('sendVideoMessage', {
            callId, senderId: userId, sender: username, senderRole: userType,
            content: newMessage, type: 'text', timestamp: Date.now(),
        });
        setNewMessage('');
    };

    const handleTyping = (typing) => {
        socketRef.current?.emit('videoTyping', { callId, userId, isTyping: typing });
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ─── Time blocked screen ──────────────────────────────────────────────────
    if (!timeStatus.allowed) {
        return (
            <div className="h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    {timeStatus.reason === 'early' ? (
                        <>
                            <h2 className="text-white text-xl font-semibold mb-2">Too Early</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                Your appointment starts in <span className="text-white font-medium">{timeStatus.minutesUntilStart} min</span>
                            </p>
                            <p className="text-gray-500 text-xs">
                                You can join 5 minutes before your scheduled time.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-white text-xl font-semibold mb-2">Appointment Expired</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                This appointment ended <span className="text-white font-medium">{timeStatus.minutesPastEnd} min ago</span>
                            </p>
                            <p className="text-gray-500 text-xs">
                                Video calls are only available during the scheduled appointment window.
                            </p>
                        </>
                    )}
                    <button
                        onClick={() => onCallEnd?.()}
                        className="mt-6 w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // ─── Main call UI ─────────────────────────────────────────────────────────
    return (
        <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">

            {/* ── Compact Header ── */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 flex-shrink-0">
                {/* Left: avatar + name + status */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {otherUser?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${callStatus === 'connected' ? 'bg-green-400' : 'bg-gray-500'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate leading-tight">
                            {userType === 'patient' ? `Dr. ${otherUser?.username}` : otherUser?.username}
                        </p>
                        <p className={`text-xs leading-tight ${callStatus === 'connected' ? 'text-green-400' : callStatus === 'ringing' ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {callStatus === 'connected' ? `${formatDuration(callDuration)}` : callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                        </p>
                    </div>
                </div>

                {/* Right: connection + chat toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isConnected
                        ? <Wifi className="w-3.5 h-3.5 text-green-400" />
                        : <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    }
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`relative p-1.5 rounded-lg transition-colors ${showChat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {messages.some(m => !m.isOwn) && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Video Area (fills remaining space) ── */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover bg-gray-900"
                />

                {/* Self video — small PiP */}
                <div className={`absolute bottom-16 right-3 transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/20 z-10 ${isLocalVideoMinimized ? 'w-16 h-12' : 'w-28 h-20 md:w-36 md:h-28'}`}>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover bg-gray-800" />
                    {!video && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff className="w-4 h-4 text-gray-500" />
                        </div>
                    )}
                    <button
                        onClick={() => setIsLocalVideoMinimized(!isLocalVideoMinimized)}
                        className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded"
                    >
                        {isLocalVideoMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
                    </button>
                    {!isLocalVideoMinimized && (
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">You</div>
                    )}
                </div>

                {/* Status overlay (connecting / ringing / failed) */}
                {callStatus !== 'connected' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-20">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center max-w-xs w-full">
                            {callStatus === 'connecting' && (
                                <>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                                        <Video className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-white font-medium">Connecting...</p>
                                    <p className="text-gray-400 text-sm mt-1">Setting up your call</p>
                                </>
                            )}
                            {callStatus === 'ringing' && (
                                <>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                                        <Video className="w-6 h-6 text-green-400" />
                                    </div>
                                    <p className="text-white font-medium">
                                        {userType === 'doctor' ? 'Waiting for patient...' : 'Waiting for doctor...'}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">{otherUser?.username} hasn't joined yet</p>
                                </>
                            )}
                            {callStatus === 'failed' && (
                                <>
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <p className="text-white font-medium">Connection Failed</p>
                                    <p className="text-gray-400 text-sm mt-1 mb-4">
                                        {!isConnected ? 'Could not reach server' : 'Check your connection'}
                                    </p>
                                    <button onClick={endCall} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors w-full">
                                        Close
                                    </button>
                                </>
                            )}
                            {callStatus === 'ended' && (
                                <>
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <PhoneOff className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-white font-medium">Call Ended</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Compact Controls Bar ── */}
            <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 flex-shrink-0">
                <button
                    onClick={toggleVideo}
                    className={`p-2.5 rounded-full transition-all ${video ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                    {video ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                    onClick={toggleAudio}
                    className={`p-2.5 rounded-full transition-all ${audio ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                    {audio ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <button
                    onClick={endCall}
                    className="p-2.5 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                    <PhoneOff size={18} />
                </button>
            </div>

            {/* ── Chat Sidebar ── */}
            {showChat && (
                <div className="fixed right-0 top-0 h-full w-72 md:w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-50 shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
                        <h3 className="text-white font-medium text-sm">Chat</h3>
                        <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-2">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-600 mt-12">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-xs">No messages yet</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${message.isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}>
                                        {!message.isOwn && (
                                            <p className="text-xs text-gray-400 mb-0.5">
                                                {message.senderRole === 'doctor' ? 'Dr. ' : ''}{message.sender}
                                            </p>
                                        )}
                                        <p className="leading-relaxed">{message.content}</p>
                                        <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                                            {message.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm">
                                    <div className="flex gap-1 items-center h-4">
                                        {[0, 150, 300].map(delay => (
                                            <div key={delay} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-800 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); handleTyping(false); } }}
                                onFocus={() => handleTyping(true)}
                                onBlur={() => handleTyping(false)}
                                placeholder="Message..."
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:border-blue-500 placeholder-gray-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}