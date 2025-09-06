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

const server_url = "ws://localhost:3000";

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
            const socket = new WebSocket(server_url.replace('ws://', 'ws://'));

            // Mock socket implementation for demo
            const mockSocket = {
                emit: (event, data) => {
                    console.log(`[SOCKET] Emitting ${event}:`, data);
                    if (event === 'join-video-call') {
                        setTimeout(() => {
                            toast.success('Connected to call room');
                            setIsConnected(true);
                            setCallStatus('ringing');
                        }, 1000);
                    }
                },
                on: (event, callback) => {
                    console.log(`[SOCKET] Listening for ${event}`);
                },
                disconnect: () => {
                    console.log('[SOCKET] Disconnecting');
                    setIsConnected(false);
                }
            };

            socketRef.current = mockSocket;
            setupSocketListeners(mockSocket);

            // Join the video call room
            mockSocket.emit('join-video-call', {
                roomId,
                callId,
                userId,
                username,
                userType
            });

        } catch (error) {
            console.error('[INIT] Failed to initialize call:', error);
            toast.error('Failed to access camera or microphone');
            setCallStatus('failed');
        }
    };

    const setupSocketListeners = (socket) => {
        // Mock socket listeners for demo
        setTimeout(() => {
            if (callStatus === 'ringing') {
                toast.success('Other participant joined the call');
                setCallStatus('connected');
            }
        }, 3000);
    };

    const createPeerConnection = () => {
        if (pcRef.current) return pcRef.current;

        console.log('[RTC] Creating peer connection');
        const pc = new RTCPeerConnection(rtcConfiguration);
        pcRef.current = pc;

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('[RTC] Received remote track');
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

        return pc;
    };

    const handleOffer = async (offer, fromUserId) => {
        const pc = createPeerConnection();
        targetUserIdRef.current = fromUserId;

        try {
            if (pc.signalingState === 'have-local-offer') {
                if (userId > fromUserId) {
                    console.log('[RTC] Ignoring offer due to glare (we win)');
                    return;
                } else {
                    console.log('[RTC] Rolling back due to glare');
                    await pc.setLocalDescription({ type: 'rollback' });
                }
            }

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

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
        if (!pc) return;

        try {
            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(answer);
                await flushPendingCandidates();
                console.log('[RTC] Answer applied successfully');
            }
        } catch (error) {
            console.error('[RTC] Error handling answer:', error);
            toast.error('Connection error occurred');
        }
    };

    const handleRemoteIceCandidate = async (candidate) => {
        const pc = pcRef.current;

        if (!pc || !pc.remoteDescription) {
            pendingCandidatesRef.current.push(new RTCIceCandidate(candidate));
            return;
        }

        try {
            await pc.addIceCandidate(candidate);
            console.log('[RTC] ICE candidate added');
        } catch (error) {
            console.error('[RTC] Error adding ICE candidate:', error);
        }
    };

    const flushPendingCandidates = async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;

        const candidates = pendingCandidatesRef.current.splice(0);
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
        cleanup();
        toast.success('Call ended');
        onCallEnd?.();
    };

    const cleanup = () => {
        console.log('[CLEANUP] Cleaning up call resources');

        // Stop local tracks
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        // Close peer connection
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        // Clean up refs
        pendingCandidatesRef.current = [];
        targetUserIdRef.current = null;
        isInitiatorRef.current = false;

        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.emit?.('leave-video-call', { callId });
            socketRef.current.disconnect?.();
            socketRef.current = null;
        }

        setCallStatus('ended');
        setIsConnected(false);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        const messageData = {
            callId,
            content: newMessage,
            sender: username,
            senderId: userId,
            senderRole: userType,
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
        socketRef.current.emit?.('sendVideoMessage', messageData);
        setNewMessage('');
        toast.success('Message sent');
    };

    const handleTyping = (typing) => {
        if (socketRef.current) {
            socketRef.current.emit?.('typing', {
                roomId: callId,
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
                                        {userType === 'doctor' ? 'Calling Patient...' : 'Calling Doctor...'}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600">Waiting for {otherUser.username} to join</p>
                                </div>
                            )}
                            {callStatus === 'failed' && (
                                <div className="space-y-4">
                                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto" />
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Connection Failed</h3>
                                    <p className="text-sm md:text-base text-gray-600">Please check your connection and try again</p>
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
                <div className={`fixed ${window.innerWidth < 768 ? 'inset-0' : 'right-0 top-0 h-full w-80 lg:w-96'} bg-white ${window.innerWidth < 768 ? '' : 'border-l border-gray-200'} flex flex-col shadow-2xl z-50 transform transition-transform duration-300`}>
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