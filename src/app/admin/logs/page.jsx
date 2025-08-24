"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Plus, FileText, AlertCircle, CheckCircle, XCircle, Info, Calendar } from "lucide-react"
import toast from "react-hot-toast"



export default function LogsPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [levelFilter, setLevelFilter] = useState("all")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newLog, setNewLog] = useState({
        action: "",
        details: "",
        feature: "created log",
    })

    useEffect(() => {
        fetchLogs()
    }, [])


    const fetchLogs = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/admin/logs")
            console.log("logs", response.data.logs.action)
            setLogs(response.data.logs || [])

        } catch (error) {

            toast.error("Failed to fetch logs")
        } finally {
            setLoading(false)
        }
    }


    const handleCreateLog = async () => {
        if (!newLog.action.trim() || !newLog.details.trim()) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            setCreating(true)
            const response = await axios.post("/api/admin/logs", newLog)
            setLogs([response.data.log, ...logs])
            setNewLog({ action: "", details: "", feature: "summarizer" })
            setCreateDialogOpen(false)
            toast.success("Log created successfully")
        } catch (error) {
            console.error("Error creating log:", error)
            toast.error("Failed to create log")
        } finally {
            setCreating(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = logs.filter((log) => {

        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesLevel = levelFilter === "all" || log.feature === levelFilter

        return matchesSearch && matchesLevel
    })

    const logStats = {
        total: logs.length,


    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground">Monitor system activities and events</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Log
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Log</DialogTitle>
                            <DialogDescription>Add a new log entry to the system</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="action">Action</Label>
                                <Input
                                    id="action"
                                    value={newLog.action}
                                    onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                                    placeholder="Enter log action"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="feature">Feature</Label>
                                <Select
                                    value={newLog.feature}
                                    onValueChange={(value) => setNewLog({ ...newLog, feature: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select log feature" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="summarizer">Summarizer</SelectItem>
                                        <SelectItem value="roadmap">Roadmap</SelectItem>
                                        <SelectItem value="task">Task</SelectItem>
                                        <SelectItem value="chatbot">Chatbot</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="details">Details</Label>
                                <Textarea
                                    id="details"
                                    value={newLog.details}
                                    onChange={(e) => setNewLog({ ...newLog, details: e.target.value })}
                                    placeholder="Enter log details"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateLog} disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Log"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logStats.total}</div>
                    </CardContent>
                </Card>

            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                </div>
                <Button onClick={fetchLogs} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>Recent system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Feature</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => {
                                    // const config = logLevelConfig[log.level]
                                    // const Icon = config.icon
                                    console.log("logs in map", log.userId)
                                    return (
                                        <TableRow key={log._id}>
                                            <TableCell>{log.feature}</TableCell>
                                            <TableCell className="font-medium">{log.action}</TableCell>
                                            <TableCell className="max-w-md">
                                                <p className="truncate" title={log.details}>
                                                    {log.details}
                                                </p>
                                            </TableCell>
                                            <TableCell>{log.userId || "System"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </TableCell>

                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}

                    {!loading && filteredLogs.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No logs found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
