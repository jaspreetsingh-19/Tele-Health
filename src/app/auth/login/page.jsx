"use client"

import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginForm() {
    const [activeTab, setActiveTab] = useState("patient")
    const [patientData, setPatientData] = useState({
        email: "",
        password: "",
    })
    const [doctorData, setDoctorData] = useState({
        doctorId: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handlePatientLogin(e) {
        e.preventDefault()
        try {
            setLoading(true)
            toast.success("logging in plz wait...")
            const response = await axios.post("/api/auth/login", patientData)

            if (response.data.role === "admin") {
                router.push("/admin/user")
            } else if (response.data.role === "doctor") {
                router.push("/doctor/dashboard")
            }
            else if (response.data.profileCompleted === true && response.data.role === "patient") {
                router.push("/patient/dashboard")
            } else {
                router.push("/patient/profile")
            }
        } catch (error) {
            toast.error(error.response?.data.error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDoctorLogin(e) {
        e.preventDefault()
        try {
            setLoading(true)
            toast.success("logging in plz wait...")
            const response = await axios.post("/api/auth/login", doctorData)

            if (response.data.role === "doctor") {
                router.push("/doctor")
            }
        } catch (error) {
            toast.error(error.response?.data.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Login Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
                        <p className="mt-2 text-sm text-gray-600">Login with your Google account</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">
                        {/* Tab Navigation */}


                        {/* Social Login Buttons */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4">

                                <button
                                    type="button"
                                    onClick={() => router.push("/api/auth/google/redirect")}
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    Login with Google
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Patient Login Form */}
                            {activeTab === "patient" && (
                                <form onSubmit={handlePatientLogin}>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                                value={patientData.email}
                                                onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                    Password
                                                </label>
                                                <Link
                                                    href={"/auth/forgot-password"}
                                                    className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
                                                >
                                                    Forgot your password?
                                                </Link>
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                value={patientData.password}
                                                onChange={(e) => setPatientData({ ...patientData, password: e.target.value })}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                        >
                                            {loading ? "Logging In" : "Login"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Doctor Login Form */}
                            {activeTab === "doctor" && (
                                <form onSubmit={handleDoctorLogin}>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                                                Doctor ID
                                            </label>
                                            <input
                                                id="doctorId"
                                                type="text"
                                                placeholder="Enter your doctor ID"
                                                required
                                                value={doctorData.doctorId}
                                                onChange={(e) => setDoctorData({ ...doctorData, doctorId: e.target.value })}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="doctor-password" className="block text-sm font-medium text-gray-700">
                                                    Password
                                                </label>
                                                <Link
                                                    href={"/auth/forgot-password"}
                                                    className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
                                                >
                                                    Forgot your password?
                                                </Link>
                                            </div>
                                            <input
                                                id="doctor-password"
                                                type="password"
                                                required
                                                value={doctorData.password}
                                                onChange={(e) => setDoctorData({ ...doctorData, password: e.target.value })}
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                        >
                                            {loading ? "Logging In" : "Login"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Sign up link */}
                            <div className="text-center text-sm text-gray-600">
                                {"Don't have an account? "}
                                <Link href={"/auth/signup"} className="underline underline-offset-4 hover:text-gray-900">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
