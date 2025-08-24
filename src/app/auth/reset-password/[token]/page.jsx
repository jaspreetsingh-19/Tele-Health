"use client"


import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { toast } from 'sonner';
import { useParams } from "next/navigation"
import axios from "axios"

export default function ResetPasswordPage() {
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: "",
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const params = useParams()
    const token = params?.token

    const isFormValid =
        passwords.password && passwords.confirmPassword && passwords.password === passwords.confirmPassword

    async function handleResetPassword(e) {
        e.preventDefault()

        if (passwords.password !== passwords.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setLoading(true)


            const response = await axios.post(`/api/auth/reset-password/${token}`, {
                password: passwords.confirmPassword,
            })


            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to reset password")
            }

            toast.success("Password reset successfully!")
            router.push("/auth/login")
        } catch (error) {
            toast.error("Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Reset Password Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
                        <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">
                        <form onSubmit={handleResetPassword}>
                            <div className="space-y-6">
                                {/* New Password Input */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={passwords.password}
                                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwords.confirmPassword && passwords.password !== passwords.confirmPassword && (
                                        <p className="text-xs text-red-600">Passwords do not match</p>
                                    )}
                                </div>

                                {/* Password Requirements */}
                                <div className="text-xs text-gray-500">
                                    <p>Password must contain:</p>
                                    <ul className="mt-1 space-y-1 list-disc list-inside">
                                        <li>At least 8 characters</li>
                                        <li>One uppercase letter</li>
                                        <li>One lowercase letter</li>
                                        <li>One number</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isFormValid || loading}
                                    className={`w-full rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${!isFormValid || loading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
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
