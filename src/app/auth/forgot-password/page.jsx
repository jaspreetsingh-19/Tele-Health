"use client"



import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'sonner';
import axios from "axios"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    async function handleForgotPassword(e) {
        e.preventDefault()
        try {

            setLoading(true)

            const response = await axios.post("/api/auth/forgot-password", { email })

            toast.success("password reset link sent Check your email")



        } catch (error) {

            toast.error("errormessage")
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Forgot Password Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <h1 className="text-xl font-semibold text-gray-900">Forgot Password</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">

                        <form onSubmit={handleForgotPassword}>
                            <div className="space-y-6">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className={`w-full rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${loading || !email
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>

                                {/* Back to Login */}
                                <div className="text-center text-sm text-gray-600">
                                    {"Remember your password? "}
                                    <Link href="/auth/login" className="underline underline-offset-4 hover:text-gray-900">
                                        Back to login
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
