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
    Settings,
    AlertCircle,
    Wifi,
    WifiOff,
    User,
    Stethoscope,
    Menu,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const server_url = "http://localhost:3000";

const rtcConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};

export default function TelehealthVideoCall({
    callId,
    userId,
    roomId,
    username,
    userType,
    patientInfo,
    doctorInfo,
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
    const [showMobileControls, setShowMobileControls] = useState(false);

    const otherUser = userType === 'patient' ? doctorInfo : patientInfo;

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

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            toast.success('Camera and microphone ready', { id: 'init-call' });

            // Initialize Socket.IO connection
            const socket = io(server_url, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            socketRef.current = socket;
            setupSocketListeners(socket);

            // Wait for socket connection
            socket.on('connect', () => {
                console.log('[SOCKET] Connected to server, socket ID:', socket.id);
                toast.success('Connected to call server');
                setIsConnected(true);

                // Join the video call room
                socket.emit('join-video-call', {
                    callId,
                    userId,
                    username
                });
            });

            socket.on('connect_error', (error) => {
                console.error('[SOCKET] Connection error:', error);
                toast.error('Failed to connect to call server. Is the server running?');
                setCallStatus('failed');
            });

            socket.on('disconnect', (reason) => {
                console.log('[SOCKET] Disconnected from server:', reason);
                setIsConnected(false);
                if (reason === 'io server disconnect') {
                    socket.connect();
                }
            });

        } catch (error) {
            console.error('[INIT] Failed to initialize call:', error);
            toast.error('Failed to access camera or microphone');
            setCallStatus('failed');
        }
    };

    const setupSocketListeners = (socket) => {
        // Handle successful join
        socket.on('video-call-joined', ({ callId: joinedCallId, callStatus: status, participantCount, otherParticipants, messages: historyMessages }) => {
            console.log('[SOCKET] Video call joined:', { joinedCallId, status, participantCount, otherParticipants });
            setCallStatus(status === 'connected' ? 'connected' : 'ringing');

            // Load message history
            if (historyMessages && historyMessages.length > 0) {
                const formattedMessages = historyMessages.map(msg => ({
                    id: msg.messageId || msg.timestamp?.toString() || Date.now().toString(),
                    content: msg.content,
                    sender: msg.sender,
                    senderId: msg.senderId,
                    senderRole: msg.senderRole,
                    timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString(),
                    isOwn: msg.senderId === userId,
                }));
                setMessages(formattedMessages);
            }

            // If there are other participants, prepare for WebRTC
            if (otherParticipants && otherParticipants.length > 0) {
                targetUserIdRef.current = otherParticipants[0].userId;
            }
        });

        // Handle other user joining
        socket.on('user-joined-video', ({ userId: joinedUserId, username: joinedUsername, callStatus: status, participantCount }) => {
            console.log('[SOCKET] User joined video:', joinedUsername, joinedUserId);
            toast.success(`${joinedUsername} joined the call`);
            setCallStatus(status === 'connected' ? 'connected' : 'ringing');

            targetUserIdRef.current = joinedUserId;
        });

        // Handle WebRTC initiation signal
        socket.on('initiate-webrtc', ({ targetUserId, targetUsername, role }) => {
            console.log('[SOCKET] Initiate WebRTC as', role, 'to', targetUsername);
            targetUserIdRef.current = targetUserId;
            isInitiatorRef.current = (role === 'caller');

            if (isInitiatorRef.current) {
                console.log('[RTC] Acting as caller, making offer');
                setTimeout(() => makeOffer(targetUserId), 500);
            }
        });

        socket.on('webrtc-ready', ({ targetUserId, targetUsername, role }) => {
            console.log('[SOCKET] WebRTC ready as', role, 'with', targetUsername);
            targetUserIdRef.current = targetUserId;
            isInitiatorRef.current = (role === 'caller');
        });

        // Handle WebRTC offer
        socket.on('webrtc-offer', async ({ offer, fromUserId, fromUsername }) => {
            console.log('[SOCKET] Received offer from:', fromUsername, fromUserId);
            await handleOffer(offer, fromUserId);
        });

        // Handle WebRTC answer
        socket.on('webrtc-answer', async ({ answer, fromUserId, fromUsername }) => {
            console.log('[SOCKET] Received answer from:', fromUsername, fromUserId);
            await handleAnswer(answer);
        });

        // Handle ICE candidates
        socket.on('webrtc-ice-candidate', async ({ candidate, fromUserId }) => {
            console.log('[SOCKET] Received ICE candidate from:', fromUserId);
            await handleRemoteIceCandidate(candidate);
        });

        // Handle user left
        socket.on('user-left-video', ({ userId: leftUserId, username: leftUsername, participantCount }) => {
            console.log('[SOCKET] User left video:', leftUsername);
            toast.info(`${leftUsername} left the call`);
            if (participantCount === 0) {
                setCallStatus('ended');
            } else {
                setCallStatus('ringing');
            }
        });

        // Handle chat messages
        socket.on('receiveVideoMessage', (messageData) => {
            console.log('[SOCKET] Received video message:', messageData);
            if (messageData.senderId !== userId) {
                const message = {
                    id: messageData.messageId || messageData.timestamp?.toString() || Date.now().toString(),
                    content: messageData.content,
                    sender: messageData.sender,
                    senderId: messageData.senderId,
                    senderRole: messageData.senderRole,
                    timestamp: new Date(messageData.timestamp || Date.now()).toLocaleTimeString(),
                    isOwn: false,
                };
                setMessages(prev => [...prev, message]);
                toast.success('New message received');
            }
        });

        // Handle message sent confirmation
        socket.on('videoMessageSent', ({ messageId, timestamp }) => {
            console.log('[SOCKET] Video message sent confirmation:', messageId);
        });

        // Handle typing indicator
        socket.on('videoTyping', ({ userId: typingUserId, username: typingUsername, isTyping: typing }) => {
            if (typingUserId !== userId) {
                setIsTyping(typing);
            }
        });

        // Handle errors
        socket.on('video-error', ({ message }) => {
            console.error('[SOCKET] Video error:', message);
            toast.error(message);
            setCallStatus('failed');
        });

        socket.on('videoMessageError', ({ error }) => {
            console.error('[SOCKET] Video message error:', error);
            toast.error('Failed to send message');
        });
    };

    const makeOffer = async (targetUserId) => {
        const pc = createPeerConnection();
        targetUserIdRef.current = targetUserId;
        makingOfferRef.current = true;

        try {
            console.log('[RTC] Creating offer');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log('[RTC] Sending offer to:', targetUserId);
            socketRef.current?.emit('webrtc-offer', {
                callId,
                offer,
                targetUserId,
            });
        } catch (error) {
            console.error('[RTC] Error making offer:', error);
            toast.error('Failed to establish connection');
        } finally {
            makingOfferRef.current = false;
        }
    };

    const createPeerConnection = () => {
        if (pcRef.current) return pcRef.current;

        console.log('[RTC] Creating peer connection');
        const pc = new RTCPeerConnection(rtcConfiguration);
        pcRef.current = pc;

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                console.log('[RTC] Adding track:', track.kind);
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('[RTC] Received remote track:', event.track.kind);
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
                setCallStatus('connected');
                toast.success('Video connection established');
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserIdRef.current && socketRef.current) {
                console.log('[RTC] Sending ICE candidate');
                socketRef.current.emit('webrtc-ice-candidate', {
                    callId,
                    candidate: event.candidate.toJSON(),
                    targetUserId: targetUserIdRef.current,
                });
            }
        };

        // Monitor connection quality
        pc.oniceconnectionstatechange = () => {
            console.log('[RTC] ICE connection state:', pc.iceConnectionState);
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    setConnectionQuality('good');
                    setCallStatus('connected');
                    toast.success('Connection quality: Good');
                    break;
                case 'disconnected':
                    setConnectionQuality('fair');
                    toast.warning('Connection quality: Fair');
                    break;
                case 'failed':
                    setConnectionQuality('poor');
                    toast.error('Connection quality: Poor');
                    break;
                default:
                    break;
            }
        };

        pc.onsignalingstatechange = () => {
            console.log('[RTC] Signaling state:', pc.signalingState);
        };

        return pc;
    };

    const handleOffer = async (offer, fromUserId) => {
        const pc = createPeerConnection();
        targetUserIdRef.current = fromUserId;

        try {
            console.log('[RTC] Handling offer, current signaling state:', pc.signalingState);

            if (pc.signalingState === 'have-local-offer') {
                if (userId > fromUserId) {
                    console.log('[RTC] Ignoring offer due to glare (we win)');
                    return;
                } else {
                    console.log('[RTC] Rolling back due to glare');
                    await pc.setLocalDescription({ type: 'rollback' });
                }
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            console.log('[RTC] Remote description set, creating answer');

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[RTC] Sending answer');

            socketRef.current?.emit('webrtc-answer', {
                callId,
                answer,
                targetUserId: fromUserId,
            });

            await flushPendingCandidates();
        } catch (error) {
            console.error('[RTC] Error handling offer:', error);
            toast.error('Failed to establish video connection');
        }
    };

    const handleAnswer = async (answer) => {
        const pc = pcRef.current;
        if (!pc) {
            console.warn('[RTC] No peer connection to handle answer');
            return;
        }

        try {
            console.log('[RTC] Handling answer, current signaling state:', pc.signalingState);

            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await flushPendingCandidates();
                console.log('[RTC] Answer applied successfully');
            } else {
                console.warn('[RTC] Cannot set answer, signaling state is:', pc.signalingState);
            }
        } catch (error) {
            console.error('[RTC] Error handling answer:', error);
            toast.error('Connection error occurred');
        }
    };

    const handleRemoteIceCandidate = async (candidate) => {
        const pc = pcRef.current;

        if (!pc || !pc.remoteDescription) {
            console.log('[RTC] Queueing ICE candidate (no remote description yet)');
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidate));
            return;
        }

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('[RTC] ICE candidate added');
        } catch (error) {
            console.error('[RTC] Error adding ICE candidate:', error);
        }
    };

    const flushPendingCandidates = async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;

        const candidates = pendingCandidatesRef.current.splice(0);
        console.log('[RTC] Flushing', candidates.length, 'pending ICE candidates');

        for (const candidate of candidates) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (error) {
                console.error('[RTC] Error adding pending ICE candidate:', error);
            }
        }
    };

    const toggleVideo = () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setVideo(videoTrack.enabled);
            toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
        }
    };

    const toggleAudio = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setAudio(audioTrack.enabled);
            toast.success(audioTrack.enabled ? 'Microphone turned on' : 'Microphone turned off');
        }
    };

    const endCall = () => {
        if (socketRef.current) {
            socketRef.current.emit('leave-video-call', { callId });
        }
        cleanup();
        toast.success('Call ended');
        onCallEnd?.();
    };

    const cleanup = () => {
        console.log('[CLEANUP] Cleaning up call resources');

        // Stop local tracks
        localStreamRef.current?.getTracks().forEach(track => {
            track.stop();
            console.log('[CLEANUP] Stopped track:', track.kind);
        });
        localStreamRef.current = null;

        // Close peer connection
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
            console.log('[CLEANUP] Closed peer connection');
        }

        // Clean up refs
        pendingCandidatesRef.current = [];
        targetUserIdRef.current = null;
        isInitiatorRef.current = false;

        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            console.log('[CLEANUP] Disconnected socket');
        }

        setCallStatus('ended');
        setIsConnected(false);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        const messageData = {
            callId,
            senderId: userId,
            sender: username,
            senderRole: userType,
            content: newMessage,
            type: 'text',
            timestamp: Date.now(),
        };

        // Add to local messages
        const message = {
            id: Date.now().toString(),
            content: newMessage,
            sender: username,
            senderId: userId,
            senderRole: userType,
            timestamp: new Date().toLocaleTimeString(),
            isOwn: true,
        };

        setMessages(prev => [...prev, message]);
        socketRef.current.emit('sendVideoMessage', messageData);
        setNewMessage('');
    };

    const handleTyping = (typing) => {
        if (socketRef.current) {
            socketRef.current.emit('videoTyping', {
                callId,
                userId,
                isTyping: typing,
            });
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getConnectionStatusIcon = () => {
        if (!isConnected) return <WifiOff className="w-4 h-4 text-red-500" />;
        return <Wifi className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = () => {
        switch (callStatus) {
            case 'connected': return 'text-green-600';
            case 'ringing': return 'text-yellow-600';
            case 'connecting': return 'text-blue-600';
            case 'failed': return 'text-red-600';
            case 'ended': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-3 md:p-4 shadow-sm flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg shadow-md">
                                {otherUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${callStatus === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-gray-900 text-sm md:text-lg truncate">
                                {userType === 'patient' ? `Dr. ${otherUser.username}` : `Patient: ${otherUser.username}`}
                            </h2>
                            <p className={`text-xs md:text-sm font-medium ${getStatusColor()}`}>
                                {callStatus === 'connected'
                                    ? `Connected • ${formatDuration(callDuration)}`
                                    : callStatus.charAt(0).toUpperCase() + callStatus.slice(1)
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                            {getConnectionStatusIcon()}
                            <span className="capitalize">{connectionQuality}</span>
                        </div>
                        <button
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setShowMobileControls(!showMobileControls)}
                        >
                            <Menu className="w-4 h-4 md:w-5 md:h-5 text-gray-600 md:hidden" />
                            <Settings className="w-5 h-5 text-gray-600 hidden md:block" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Status Bar */}
            {showMobileControls && (
                <div className="bg-gray-50 p-2 border-b border-gray-200 md:hidden">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                        {getConnectionStatusIcon()}
                        <span className="capitalize">{connectionQuality} connection</span>
                    </div>
                </div>
            )}

            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900 overflow-hidden">
                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Local Video (Picture-in-Picture) */}
                <div className={`absolute transition-all duration-300 ${isLocalVideoMinimized
                    ? 'top-4 right-4 w-20 h-16 md:w-24 md:h-18'
                    : 'top-4 right-4 w-32 h-24 md:w-64 md:h-48'
                    } bg-gray-800 border-2 border-white rounded-lg md:rounded-xl overflow-hidden shadow-xl z-10`}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 md:px-2 md:py-1 rounded">
                        {isLocalVideoMinimized ? 'You' : `You (${username})`}
                    </div>
                    {!video && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff className="w-4 h-4 md:w-8 md:h-8 text-gray-400" />
                        </div>
                    )}
                    <button
                        onClick={() => setIsLocalVideoMinimized(!isLocalVideoMinimized)}
                        className="absolute top-1 right-1 md:top-2 md:right-2 bg-black bg-opacity-75 text-white p-1 rounded hover:bg-opacity-100 transition-colors"
                    >
                        {isLocalVideoMinimized ? (
                            <Maximize2 className="w-3 h-3 md:w-4 md:h-4" />
                        ) : (
                            <Minimize2 className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                    </button>
                </div>

                {/* Call Status Overlay */}
                {callStatus !== 'connected' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-2xl max-w-sm mx-auto">
                            {callStatus === 'connecting' && (
                                <div className="space-y-4">
                                    <div className="animate-pulse w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                                        <Video className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Connecting...</h3>
                                    <p className="text-sm md:text-base text-gray-600">Setting up your video call</p>
                                </div>
                            )}
                            {callStatus === 'ringing' && (
                                <div className="space-y-4">
                                    <div className="animate-bounce w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                                        <Video className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                                        {userType === 'doctor' ? 'Waiting for Patient...' : 'Waiting for Doctor...'}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600">Waiting for {otherUser.username} to join</p>
                                </div>
                            )}
                            {callStatus === 'failed' && (
                                <div className="space-y-4">
                                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto" />
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Connection Failed</h3>
                                    <p className="text-sm md:text-base text-gray-600">
                                        {!isConnected ? 'Could not connect to server. Please check if the server is running.' : 'Please check your connection and try again'}
                                    </p>
                                    <button
                                        onClick={endCall}
                                        className="px-4 py-2 md:px-6 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex-shrink-0">
                <div className="flex justify-center items-center space-x-4 md:space-x-6">
                    <button
                        onClick={toggleVideo}
                        className={`p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 ${video
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            }`}
                    >
                        {video ? <Video size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
                    </button>

                    <button
                        onClick={toggleAudio}
                        className={`p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 ${audio
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            }`}
                    >
                        {audio ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
                    </button>

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="p-3 md:p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-105 shadow-lg relative"
                    >
                        <MessageSquare size={20} className="md:w-6 md:h-6" />
                        {messages.some(m => !m.isOwn) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <PhoneOff size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
                <div className={`fixed ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'inset-0' : 'right-0 top-0 h-full w-80 lg:w-96'} bg-white ${typeof window !== 'undefined' && window.innerWidth < 768 ? '' : 'border-l border-gray-200'} flex flex-col shadow-2xl z-50 transform transition-transform duration-300`}>
                    <div className="p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 text-lg">Chat</h3>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <MessageSquare className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-sm md:text-base">No messages yet</p>
                                <p className="text-xs md:text-sm">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`${message.isOwn ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block p-3 rounded-2xl max-w-xs break-words shadow-sm ${message.isOwn
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                        }`}>
                                        {!message.isOwn && (
                                            <div className="text-xs font-medium mb-1 opacity-70">
                                                {message.senderRole === 'doctor' ? 'Dr. ' : ''}{message.sender}
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed">{message.content}</div>
                                        <div className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="text-left">
                                <div className="inline-block p-3 bg-gray-100 rounded-2xl rounded-bl-md">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="flex space-x-2 md:space-x-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                        handleTyping(false);
                                    }
                                }}
                                onFocus={() => handleTyping(true)}
                                onBlur={() => handleTyping(false)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 md:p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm md:text-base"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className="p-2 md:p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                            >
                                <Send size={16} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Demo App Component
export function TelehealthApp() {
    const [inCall, setInCall] = useState(false);
    const [userType, setUserType] = useState('patient');

    // Mock data for demonstration
    const callId = 'demo-call-123';
    const patientInfo = {
        id: 'patient-1',
        username: 'John Smith',
        type: 'patient',
    };
    const doctorInfo = {
        id: 'doctor-1',
        username: 'Sarah Johnson',
        type: 'doctor',
    };

    const currentUser = userType === 'patient' ? patientInfo : doctorInfo;

    const startCall = () => {
        setInCall(true);
        toast.success('Starting video consultation...');
    };

    const endCall = () => {
        setInCall(false);
        toast.info('Video consultation ended');
    };

    if (inCall) {
        return (
            <TelehealthVideoCall
                callId={callId}
                userId={currentUser.id}
                roomId={callId}
                username={currentUser.username}
                userType={userType}
                patientInfo={patientInfo}
                doctorInfo={doctorInfo}
                onCallEnd={endCall}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-8 md:mb-12">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                        <Stethoscope className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                        Telehealth Video Consultation
                    </h1>
                    <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                        Connect with healthcare professionals through secure, high-quality video calls with integrated chat messaging.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto px-4">
                    {/* Demo Controls */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                            <User className="w-5 h-5 md:w-6 md:h-6 mr-3 text-blue-500" />
                            Demo Setup
                        </h2>
                        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                            <button
                                onClick={() => setUserType('patient')}
                                className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 text-left ${userType === 'patient'
                                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                                        <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Join as Patient</h3>
                                        <p className="text-xs md:text-sm text-gray-600">John Smith</p>
                                    </div>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600">
                                    Experience the patient view of the telehealth consultation with video and chat features.
                                </p>
                            </button>

                            <button
                                onClick={() => setUserType('doctor')}
                                className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 text-left ${userType === 'doctor'
                                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                                        <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Join as Doctor</h3>
                                        <p className="text-xs md:text-sm text-gray-600">Dr. Sarah Johnson</p>
                                    </div>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600">
                                    Experience the healthcare provider view with professional consultation tools.
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Call Information */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                            <Video className="w-5 h-5 md:w-6 md:h-6 mr-3 text-blue-500" />
                            Consultation Details
                        </h2>
                        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="text-xs md:text-sm font-medium text-gray-500">Patient</label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">{patientInfo.username}</p>
                                </div>
                                <div>
                                    <label className="text-xs md:text-sm font-medium text-gray-500">Healthcare Provider</label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">Dr. {doctorInfo.username}</p>
                                </div>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="text-xs md:text-sm font-medium text-gray-500">Consultation Type</label>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">Video Consultation</p>
                                </div>
                                <div>
                                    <label className="text-xs md:text-sm font-medium text-gray-500">Status</label>
                                    <p className="text-base md:text-lg font-semibold text-green-600">Ready to Connect</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Call Button */}
                    <div className="text-center mb-8 md:mb-16">
                        <button
                            onClick={startCall}
                            className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-xl text-sm md:text-base"
                        >
                            <Video className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                            Start Video Consultation
                        </button>
                        <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-4">
                            Ensure your camera and microphone are enabled for the best experience
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                        <div className="text-center p-4 md:p-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Video className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">HD Video Quality</h3>
                            <p className="text-gray-600 text-xs md:text-sm">Crystal clear video streaming for accurate consultations</p>
                        </div>

                        <div className="text-center p-4 md:p-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Secure Messaging</h3>
                            <p className="text-gray-600 text-xs md:text-sm">Real-time chat for sharing information during the call</p>
                        </div>

                        <div className="text-center p-4 md:p-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Professional Tools</h3>
                            <p className="text-gray-600 text-xs md:text-sm">Built specifically for healthcare consultations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}