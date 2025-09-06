"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const MedicalReportAnalyzer = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setResult(null)
    setError(null)

    if (selectedFile && selectedFile.type !== "application/pdf") {
      const errorMsg = "Please select a PDF file only"
      setError(errorMsg)
      setFile(null)
      toast.error(errorMsg)
    } else if (selectedFile) {
      toast.success(`File "${selectedFile.name}" selected successfully`)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    toast.loading("Analyzing medical report with AI...", { id: "analysis" })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze-report", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      toast.success("Medical report analyzed successfully!", { id: "analysis" })
    } catch (err) {
      console.error("Upload error:", err)
      const errorMsg = err.message || "Upload failed"
      setError(errorMsg)
      toast.error(errorMsg, { id: "analysis" })
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
      setResult(null)
      setError(null)
      toast.success(`File "${droppedFile.name}" dropped successfully`)
    } else {
      const errorMsg = "Please drop a PDF file only"
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            AI Medical Report Analyzer
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Upload any PDF medical report from anywhere on your system for comprehensive AI-powered analysis
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Upload Medical Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 sm:p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-xs sm:text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:sm:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Analyzing Report with AI...</span>
                  <span className="sm:hidden">Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Upload & Analyze Report</span>
                  <span className="sm:hidden">Upload & Analyze</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                AI Analysis Results
              </CardTitle>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <p className="truncate">File: {result.fileName}</p>
                <p>Size: {(result.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Analyzed: {new Date().toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm sm:text-base text-foreground bg-muted p-4 sm:p-6 rounded-md border overflow-x-auto">
                  {result.analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-900 text-xs sm:text-sm mb-1">
                Medical Disclaimer
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                This AI analysis is for informational purposes only and should not replace professional
                medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalReportAnalyzer