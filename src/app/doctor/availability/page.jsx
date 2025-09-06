"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Settings, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axios from "axios"

export default function DoctorAvailabilityPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [availability, setAvailability] = useState(null)
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        slotDuration: 30,
        isAvailable: true,
    })

    const fetchAvailability = async (date) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/doctor-availability?date=${date}`)
            if (response.data.success && response.data.availability.length > 0) {
                setAvailability(response.data.availability[0])
                setSettings({
                    ...settings,
                    isAvailable: response.data.availability[0].isAvailable,
                })
            } else {
                setAvailability(null)
            }
        } catch (error) {
            console.error("Error fetching availability:", error)
            toast.error("Failed to fetch availability data")
        } finally {
            setLoading(false)
        }
    }

    const saveAvailability = async () => {
        try {
            setLoading(true)
            const response = await axios.post("/api/doctor-availability", {
                date: selectedDate,
                ...settings,
            })

            if (response.data.success) {
                toast.success("Availability updated successfully")
                fetchAvailability(selectedDate)
            }
        } catch (error) {
            toast.error("Failed to update availability")
        } finally {
            setLoading(false)
        }
    }

    const generateTimeOptions = () => {
        const times = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
                times.push({ value: timeString, label: displayTime })
            }
        }
        return times
    }

    const getNextWeekDates = () => {
        const dates = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push({
                value: date.toISOString().split("T")[0],
                label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                isToday: i === 0,
            })
        }
        return dates
    }

    useEffect(() => {
        fetchAvailability(selectedDate)
    }, [selectedDate])

    const timeOptions = generateTimeOptions()
    const weekDates = getNextWeekDates()

    return (
        <div className="min-h-screen bg-background p-3 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Availability Management</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Manage your consultation schedule and working hours</p>
                    </div>
                    <Button
                        onClick={saveAvailability}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                {/* Quick Date Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Quick Date Selection
                        </CardTitle>
                        <CardDescription className="text-sm">Select a date to manage your availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {weekDates.map((date) => (
                                <Button
                                    key={date.value}
                                    variant={selectedDate === date.value ? "default" : "outline"}
                                    className={`min-w-fit text-xs sm:text-sm ${selectedDate === date.value ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                                        }`}
                                    onClick={() => setSelectedDate(date.value)}
                                >
                                    {date.label}
                                    {date.isToday && (
                                        <Badge className="ml-1 sm:ml-2 bg-accent text-accent-foreground text-xs">
                                            Today
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="custom-date" className="text-sm">Or select a custom date:</Label>
                            <Input
                                id="custom-date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-1 w-full sm:max-w-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="schedule" className="space-y-4 sm:space-y-6">
                    <TabsList className="grid w-full grid-cols-2 h-auto">
                        <TabsTrigger value="schedule" className="text-xs sm:text-sm">Schedule</TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
                        {/* Availability Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-lg">
                                    <span className="text-sm sm:text-base">
                                        Availability Status for {new Date(selectedDate).toLocaleDateString()}
                                    </span>
                                    <Switch
                                        checked={settings.isAvailable}
                                        onCheckedChange={(checked) => setSettings({ ...settings, isAvailable: checked })}
                                    />
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    {settings.isAvailable ? "You are available for consultations" : "You are not available"}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Time Slots Display */}
                        {settings.isAvailable && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                        Time Slots Preview
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Based on your current settings: {settings.startTime} - {settings.endTime} with{" "}
                                        {settings.slotDuration} minute slots
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-muted-foreground text-sm">Loading time slots...</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
                                            {availability?.timeSlots?.map((slot, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-lg border p-2 sm:p-3 text-center text-xs sm:text-sm ${slot.isBooked
                                                            ? "border-destructive bg-destructive/10 text-destructive"
                                                            : "border-primary bg-primary/10 text-primary"
                                                        }`}
                                                >
                                                    <div className="font-medium">
                                                        {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString("en-US", {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })}
                                                    </div>
                                                    <div className="text-xs">{slot.isBooked ? "Booked" : "Available"}</div>
                                                </div>
                                            )) || (
                                                    <div className="col-span-full text-center text-muted-foreground text-sm">
                                                        No time slots configured. Update your settings and save to generate slots.
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 sm:space-y-6">
                        {/* Working Hours Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    Working Hours Configuration
                                </CardTitle>
                                <CardDescription className="text-sm">Set your default working hours and consultation duration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                                        <Select
                                            value={settings.startTime}
                                            onValueChange={(value) => setSettings({ ...settings, startTime: value })}
                                        >
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Select start time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.slice(0, 48).map((time) => (
                                                    <SelectItem key={time.value} value={time.value}>
                                                        {time.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end-time" className="text-sm">End Time</Label>
                                        <Select
                                            value={settings.endTime}
                                            onValueChange={(value) => setSettings({ ...settings, endTime: value })}
                                        >
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Select end time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.slice(0, 48).map((time) => (
                                                    <SelectItem key={time.value} value={time.value}>
                                                        {time.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="break-start" className="text-sm">Break Start Time</Label>
                                        <Select
                                            value={settings.breakStart}
                                            onValueChange={(value) => setSettings({ ...settings, breakStart: value })}
                                        >
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Select break start" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.slice(0, 48).map((time) => (
                                                    <SelectItem key={time.value} value={time.value}>
                                                        {time.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="break-end" className="text-sm">Break End Time</Label>
                                        <Select
                                            value={settings.breakEnd}
                                            onValueChange={(value) => setSettings({ ...settings, breakEnd: value })}
                                        >
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Select break end" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.slice(0, 48).map((time) => (
                                                    <SelectItem key={time.value} value={time.value}>
                                                        {time.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slot-duration" className="text-sm">Consultation Duration (minutes)</Label>
                                    <Select
                                        value={settings.slotDuration.toString()}
                                        onValueChange={(value) => setSettings({ ...settings, slotDuration: Number.parseInt(value) })}
                                    >
                                        <SelectTrigger className="w-full sm:max-w-xs text-sm">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="45">45 minutes</SelectItem>
                                            <SelectItem value="60">60 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                                <CardDescription className="text-sm">Common availability management tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                                    <Button
                                        variant="outline"
                                        className="hover:bg-secondary bg-transparent text-sm w-full sm:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Copy to Next Week
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hover:bg-secondary bg-transparent text-sm w-full sm:w-auto"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Bulk Update Dates
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hover:bg-secondary bg-transparent text-sm w-full sm:w-auto"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Save as Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}