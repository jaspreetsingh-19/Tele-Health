"use client";
import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, Square } from "lucide-react";

export default function SpeechToTextInput({ onTranscript }) {
    const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [isRecording, setIsRecording] = useState(false);

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">Your browser does not support speech recognition.</p>
            </div>
        );
    }

    const startListening = () => {
        setIsRecording(true);
        SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    };

    const stopListening = () => {
        setIsRecording(false);
        SpeechRecognition.stopListening();
        onTranscript(transcript);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Main container with subtle background */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Voice Input</h3>

                    {/* Recording button - positioned in top right */}
                    <button
                        onClick={isRecording ? stopListening : startListening}
                        className={`relative p-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50
                             ${isRecording
                                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300 animate-pulse"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-300"
                            }`}
                        title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                        {isRecording ? (
                            <Square className="h-4 w-4 text-white" />
                        ) : (
                            <Mic className="h-4 w-4 text-white" />
                        )}

                        {/* Recording indicator dot */}
                        {isRecording && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        )}
                    </button>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isRecording ? "bg-red-500" : "bg-gray-300"
                        }`}></div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${isRecording ? "text-red-600" : "text-gray-500"
                        }`}>
                        {isRecording ? "Recording..." : "Ready to record"}
                    </span>
                </div>

                {/* Transcript display */}
                <div className="min-h-[120px]">
                    {transcript ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium">Transcript:</p>
                                    <p className="text-gray-800 leading-relaxed">{transcript}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <p className="text-gray-500 text-sm">Your speech will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}