"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "sonner"
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
    Bot
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
        url: "/patient/dashboard",
        icon: Home,
        description: "Overview of your health journey",
    },
    {
        title: "Book Appointments",
        url: "/patient/doctors",
        icon: Calendar,
        description: "Schedule and manage appointments",
    },
    {
        title: "My Appointments",
        url: "/patient/appointment",
        icon: Calendar,
        description: "View your scheduled appointments",
    },
    {
        title: "Video Consultation",
        url: "/patient/videoCallDoc",
        icon: Video,
        description: "Join video calls with doctors",
    },
    {
        title: "Chat with Doctors",
        url: "/patient/chatWithDoc",
        icon: MessageCircle,
        description: "Real-time messaging with healthcare providers",
    },
    {
        title: "Reports Analyzer",
        url: "/patient/reportAnalyzer",
        icon: FileText,
        description: "View your medical history and reports",
    },
    {
        title: "AI Symptoms Checker",
        url: "/patient/symptoms",
        icon: Bot,
        description: "View your medical history and reports",
    },
    {
        title: "Medical Records",
        url: "/patient/records",
        icon: FileText,
        description: "View your medical history and reports",
    },
    {
        title: "Payment History",
        url: "/patient/payment-history",
        icon: CreditCard,
        description: "View payment history and invoices",
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

                // Fetch upcoming appointments count
                try {
                    // const appointmentsRes = await axios.get("/api/appointments/upcoming")
                    // setUpcomingAppointments(appointmentsRes.data.count || 0)
                } catch (error) {
                    console.error("Failed to fetch appointments", error)
                }
            } catch (error) {
                console.error("Failed to fetch user", error)
                router.push("/auth/login")
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
                        <h1 className="text-lg font-semibold">TELE-HEALTH</h1>
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
                        <h1 className="text-lg font-semibold">TELE-HEALTH</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {upcomingAppointments > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {upcomingAppointments} upcoming
                        </Badge>
                    )}
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
                                        Patient
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarOpen ? "ml-64" : "ml-0")}>
                    <div className="p-6">{children}</div>
                    <Toaster position="top-right" />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={toggleSidebar} />}
        </div>
    )
}
