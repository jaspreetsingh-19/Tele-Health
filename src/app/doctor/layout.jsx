"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Home,
    LogOut,
    Moon,
    Settings,
    Sun,
    Calendar,
    Menu,
    X,
    FileText,
    Video,
    MessageCircle,
    CreditCard,
    Clock,
    Loader2,
    Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"

const getNavigationItems = () => [
    {
        title: "Dashboard",
        url: "/doctor/dashboard",
        icon: Home,
        description: "Overview of your practice",
    },
    {
        title: "Appointments",
        url: "/doctor/appointments",
        icon: Calendar,
        description: "Manage patient appointments",
    },
    {
        title: "Video Consultation",
        url: "/doctor/consultation",
        icon: Video,
        description: "Start video calls with patients",
    },
    {
        title: "Chat with Patients",
        url: "/doctor/chatWithPatient",
        icon: MessageCircle,
        description: "Real-time messaging with patients",
    },
    {
        title: "Patient Records",
        url: "/doctor/records",
        icon: FileText,
        description: "View patient medical history",
    },
    {
        title: "Availability",
        url: "/doctor/availability",
        icon: Clock,
        description: "Set your availability schedule",
    },
    {
        title: "Earnings",
        url: "/doctor/earnings",
        icon: CreditCard,
        description: "View earnings and payments",
    },
    {
        title: "Settings",
        url: "/doctor/settings",
        icon: Settings,
        description: "Account and notification preferences",
    },
]

const getInitials = (username) => {
    if (!username) return ""
    const parts = username.trim().split(" ")
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [upcomingAppointments, setUpcomingAppointments] = useState(0)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true)
                const res = await axios.get("/api/auth/me")
                setUser(res.data)
            } catch (error) {
                console.error("Failed to fetch user", error)
                router.push("/login")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [router])

    // Show full page loading until user data is loaded
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Heart className="size-4" />
                        </div>
                        <h1 className="text-lg font-semibold">HealthCare Connect</h1>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading your dashboard...</span>
                    </div>
                </div>
            </div>
        )
    }

    const initial = getInitials(user?.data?.username)
    const navigationItems = getNavigationItems()

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle("dark")
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    async function handleLogout(e) {
        e.preventDefault()
        try {
            toast.success("Logging out, please wait...")
            await axios.get("/api/auth/logout")
            router.push("/")
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className={cn("min-h-screen bg-background text-foreground", isDarkMode && "dark")}>
            {/* Top Bar - Full Width */}
            <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9">
                        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                            <Heart className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold">HealthCare Connect</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <div className="flex h-full flex-col">
                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-6">
                                {/* Quick Actions Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Video className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Quick Actions</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            size="sm"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => router.push("/doctor/availability")}
                                        >
                                            Set Availability
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full bg-transparent"
                                            onClick={() => router.push("/doctor/consultation")}
                                        >
                                            Start Consultation
                                        </Button>
                                    </div>
                                </div>

                                {/* Navigation Section */}
                                <div>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Navigation
                                    </h3>
                                    <nav className="space-y-1">
                                        {navigationItems.map((item) => {
                                            const isCurrentPath = pathname === item.url
                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.url}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                        isCurrentPath && "bg-accent text-accent-foreground",
                                                    )}
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    <div className="flex-1">
                                                        <span className="font-medium">{item.title}</span>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-border">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.data?.avatar || "/placeholder.svg"} alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-sm font-semibold truncate">{user?.data?.username || "User"}</span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {user?.data?.email || "user@example.com"}
                                    </span>
                                    <Badge variant="outline" className="text-xs mt-1 w-fit">
                                        Doctor
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarOpen ? "ml-64" : "ml-0")}>
                    <div className="p-6">{children}</div>
                    {/* <Toaster position="top-right" /> */}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={toggleSidebar} />}
        </div>
    )
}
