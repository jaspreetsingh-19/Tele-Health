"use client"

import Link from "next/link"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { toast } from 'sonner';


export default function SignupPage() {

    const [user, setUser] = useState({
        username: "",
        email: "",
        password: ""

    })
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    async function handleSignup(e) {
        e.preventDefault()
        try {
            setLoading(true)

            const response = await axios.post("/api/auth/signup", user)


            toast.success("registered")
            router.push("/auth/verify-email")

        } catch (error) {


            toast.error(error.response?.data.error)
            setLoading(false)
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
                        <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>
                        <p className="mt-2 text-sm text-gray-600">Signup with your Github or Google account</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSignup}>
                            <div className="space-y-6">
                                {/* Social Signup Buttons */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/api/auth/github/redirect")}
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.76-1.604-2.665-.3-5.466-1.332-5.466-5.932 0-1.31.468-2.38 1.236-3.22-.124-.302-.536-1.52.116-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.552 3.296-1.23 3.296-1.23.653 1.656.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.63-5.476 5.922.43.372.823 1.1.823 2.22v3.293c0 .32.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z"
                                            />


                                        </svg>
                                        Signup with Github
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/api/auth/github/redirect")}
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                        </svg>
                                        Signup with Google
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

                                {/* Email and Password Form */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                Username
                                            </label>

                                        </div>
                                        <input
                                            id="username"
                                            type="text"
                                            required
                                            value={user.username}
                                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            value={user.email}
                                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>

                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={user.password}
                                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        Signup
                                    </button>
                                </div>

                                {/* Login link */}
                                <div className="text-center text-sm text-gray-600">
                                    {"Already have an Account! "}
                                    <Link href={"/auth/login"} className="underline underline-offset-4 hover:text-gray-900">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>



            </div>
        </div>
    )
}
