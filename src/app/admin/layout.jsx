"use client"


import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Toaster } from "sonner"

import {

    Home,
    LogOut,
    Moon,
    Settings,
    Sun,
    User,
    BarChart3,
    Mail,
    Menu,
    X,
    Users,
    Map,
    NotebookText,
    Library,
    Bot,
    FileText,
    Heart


} from "lucide-react"




import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import Link from "next/link"

const navigationItems = [
    {
        title: "Patients",
        url: "/admin/user",
        icon: Users,

    },
    {
        title: "Doctors",
        url: "/admin/doctors",
        icon: Users,
    },
    {
        title: "Logs",
        url: "/admin/logs",
        icon: BarChart3,
    },

]


const getInitials = (username) => {
    if (!username) return "";

    const parts = username.trim().split(" ");

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
};


export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null)
    const pathname = usePathname()


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/auth/me")
                setUser(res.data)
            } catch (error) {
                console.error("Failed to fetch user", error)
            }
        }


        fetchUser()


    }, [])

    const initial = getInitials(user?.data?.username)




    const [isDarkMode, setIsDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const router = useRouter()


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


            // toast.success("logging out")
            const response = await axios.get("/api/auth/logout")


            router.push("/auth/login")

        } catch (error) {

            // toast.error("Something went wrong")


        }
    }

    return (

        <div className={cn("min-h-screen bg-background text-foreground", isDarkMode && "dark")}>
            {/* Top Bar - Full Width */}
            <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 dark:border-border dark:bg-background/95">
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
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2 border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-border dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out dark:border-border dark:bg-background",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <div className="flex h-full flex-col">
                        {/* Sidebar Header */}


                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-6">
                                {/* Navigation Section */}
                                <div>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Navigation
                                    </h3>
                                    <nav className="space-y-1">
                                        {navigationItems.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.url}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
                                                    pathname === item.url &&
                                                    "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground",
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.title}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>



                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-b border-border dark:border-border">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                    <AvatarFallback>{initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{user?.data.username || "..."}</span>
                                    <span className="text-xs text-muted-foreground">{user?.data.email || "..."}</span>
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
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/50 dark:bg-black/70 lg:hidden" onClick={toggleSidebar} />
            )}
        </div>
    )
}