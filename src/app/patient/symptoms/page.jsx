"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Activity, Trash2, Loader2, History, Copy, Check, AlertCircle, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import SpeechToTextInput from "@/components/speech-input"

export default function SymptomsPage() {
    const [inputText, setInputText] = useState("")
    const [currentAnalysis, setCurrentAnalysis] = useState(null)
    const [previousSymptoms, setPreviousSymptoms] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [error, setError] = useState(null)
    const [isListening, setIsListening] = useState(false)


    useEffect(() => {
        fetchPreviousSymptoms()
    }, [])

    const fetchPreviousSymptoms = async () => {
        try {
            const response = await axios.get("/api/symptom")
            console.log("response is ", response)

            const symptomsData = response.data.symptoms || response.data || []
            setPreviousSymptoms(symptomsData)
            toast.success("Previous symptoms loaded successfully")
        } catch (error) {
            console.error("Failed to fetch previous symptoms:", error)
            toast.error("Failed to load previous symptoms")
        }
    }

    const handleAnalyze = async () => {


        setIsLoading(true)
        setError(null)


        try {
            const response = await axios.post("/api/symptom", {
                inputText: inputText.trim(),
            })
            console.log("response from post", response.data.symptom.aiResult)

            const newAnalysis = {
                _id: Date.now().toString(),
                inputText: inputText,
                aiResult: response.data.symptom.aiResult,
                createdAt: new Date().toISOString(),
            }


            setCurrentAnalysis(newAnalysis)

            await fetchPreviousSymptoms()
            toast.success("Symptoms analyzed successfully!", { id: "analyze-toast" })


            setInputText("")

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to analyze symptoms"
            setError(errorMessage)
            toast.error(`Analysis failed: ${errorMessage}`, { id: "analyze-toast" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteSymptom = async (patient) => {
        try {

            await axios.delete(`/api/symptom/${patient}`)
            setPreviousSymptoms((prev) => prev.filter((s) => s._id !== patient))
            if (currentAnalysis?._id === patient) {
                setCurrentAnalysis(null)
                toast.info("Current analysis cleared")
            }
            toast.success("Symptom record deleted successfully", { id: "delete-toast" })
        } catch (error) {
            console.error("Failed to delete symptom:", error)
            toast.error("Failed to delete symptom record", { id: "delete-toast" })
        }
    }



    const loadPreviousSymptom = (symptom) => {
        setCurrentAnalysis(symptom)
        setInputText(symptom.inputText)
        setShowHistory(false)
        setError(null)
        toast.success("Previous symptom analysis loaded successfully")
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getPreviewText = (text, maxLength = 50) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
    }

    const handleHistoryToggle = () => {
        setShowHistory(!showHistory)
    }

    const handleInputChange = (e) => {
        const newValue = e.target.value
        setInputText(newValue)

        // Clear error when user starts typing
        if (error && newValue.length > 0) {
            setError(null)
            toast.success("Error cleared - you can try again")
        }


    }


    const handleVoiceInput = () => {
        setIsListening(!isListening)
    }

    const handleTranscript = (transcript) => {
        setInputText(transcript)
    }

    const handleListeningChange = (listening) => {
        setIsListening(listening)
    }

    const handleSubmit = () => {
        handleAnalyze()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Symptom Checker</h1>
                    <p className="text-muted-foreground">Get AI-powered analysis of your symptoms instantly</p>
                </div>
                <Button variant="outline" onClick={handleHistoryToggle} className="flex items-center gap-2 bg-transparent">
                    <History className="h-4 w-4" />
                    {showHistory ? "Hide History" : "View History"}
                    {previousSymptoms.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {previousSymptoms.length}
                        </Badge>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className={cn("space-y-6", showHistory ? "lg:col-span-2" : "lg:col-span-3")}>
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Describe Your Symptoms
                            </CardTitle>
                            <CardDescription>Describe your symptoms in detail to get AI-powered medical insights</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Describe your symptoms in detail... (e.g., I have a headache, fever, and sore throat that started yesterday)"
                                    value={inputText}
                                    onChange={handleInputChange}
                                    className="min-h-[200px] resize-none"
                                    disabled={isLoading}
                                />

                                {isListening && (
                                    <SpeechToTextInput
                                        onTranscript={handleTranscript}
                                        onListeningChange={handleListeningChange}
                                        isListening={isListening}
                                    />
                                )}

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">{inputText.length} characters</span>
                                        {inputText.length > 0 && inputText.length < 10 && (
                                            <span className="text-sm text-amber-600 dark:text-amber-400">Minimum 10 characters required</span>
                                        )}
                                        {inputText.length >= 10 && (
                                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                Ready to analyze
                                            </span>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleVoiceInput}
                                            className={cn("flex items-center gap-2", isListening && "bg-red-50 border-red-200 text-red-700")}
                                        >
                                            <Mic className={cn("h-4 w-4", isListening && "text-red-600")} />
                                            {isListening ? "Stop Voice" : "Voice Input"}
                                        </Button>
                                    </div>
                                    <Button onClick={handleSubmit} disabled={isLoading || inputText.length < 0} className="px-6">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="h-4 w-4 mr-2" />
                                                Analyze Symptoms
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Analysis Display */}
                    {currentAnalysis && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Symptom Analysis
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4">
                                            <span>Symptoms ({currentAnalysis.inputText.length} characters)</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSymptom(currentAnalysis._id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Input Symptoms */}
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">YOUR SYMPTOMS</h4>
                                        <p className="text-sm bg-muted p-3 rounded-lg">{currentAnalysis.inputText}</p>
                                    </div>

                                    <Separator />

                                    {/* AI Analysis Results */}
                                    {currentAnalysis.aiResult && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">AI ANALYSIS</h4>
                                            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <div className="whitespace-pre-wrap leading-relaxed">{currentAnalysis.aiResult}</div>
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}

                                    {/* Medical Disclaimer */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-amber-900 text-sm mb-1">Medical Disclaimer</p>
                                                <p className="text-xs text-amber-800">
                                                    This AI analysis is for informational purposes only and should not replace professional
                                                    medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Analyzing Symptoms...</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Our AI is carefully analyzing your symptoms and generating medical insights...
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!currentAnalysis && !isLoading && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Describe your symptoms above to get your first AI-powered medical analysis.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="lg:col-span-1">
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Previous Symptoms
                                </CardTitle>
                                <CardDescription>{previousSymptoms.length} symptom records saved</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {previousSymptoms.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground">
                                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No previous symptoms</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 p-2">
                                            {previousSymptoms.map((symptom, index) => (
                                                <div key={symptom._id}>
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                                            currentAnalysis?._id === symptom._id && "bg-accent",
                                                        )}
                                                        onClick={() => loadPreviousSymptom(symptom)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium truncate">
                                                                    {getPreviewText(symptom.inputText, 40)}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-xs text-muted-foreground">{formatDate(symptom.createdAt)}</p>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleDeleteSymptom(symptom._id)
                                                                        }}
                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
