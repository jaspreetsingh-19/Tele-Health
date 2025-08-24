"use client"



import Link from "next/link"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axios from "axios"

export default function Component() {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)

    const inputRefs = useRef([])
    const router = useRouter()

    const isCodeComplete = code.every((digit) => digit !== "")

    const handleInputChange = (index, value) => {
        if (value.length > 1) return // Prevent multiple characters

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").slice(0, 6)
        const newCode = [...code]

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            if (/^\d$/.test(pastedData[i])) {
                newCode[i] = pastedData[i]
            }
        }
        setCode(newCode)

        // Focus the next empty input after pasting
        const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
        if (nextEmptyIndex !== -1) {
            setTimeout(() => {
                inputRefs.current[nextEmptyIndex]?.focus()
            }, 0)
        } else if (pastedData.length < 6) {
            // If all filled but paste was shorter than 6 digits, focus the last filled input
            const lastFilledIndex = Math.min(pastedData.length - 1, 5)
            setTimeout(() => {
                inputRefs.current[lastFilledIndex]?.focus()
            }, 0)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const verificationCode = code.join("").toString()

        try {
            setIsLoading(true)

            const response = await axios.post("/api/auth/verify-email", { code: verificationCode })

            toast.success("email verified ")
            router.push("/auth/login")

        } catch (error) {

            toast.error("error message")
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }

    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Verification Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
                        <p className="mt-2 text-sm text-gray-600">We sent a verification code to your email address</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Verification Code Section */}
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h2 className="text-sm font-medium text-gray-700 mb-4">Enter verification code</h2>
                                    </div>

                                    {/* Code Input */}
                                    <div className="flex justify-center space-x-2">
                                        {code.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ""))}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                className="block w-12 h-12 text-center text-lg font-medium rounded-md border border-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                aria-label={`Digit ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={!isCodeComplete || isLoading}
                                    className={`w-full rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${!isCodeComplete || isLoading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {isLoading ? "Verifying..." : "Verify Code"}
                                </button>



                                {/* Back to Login */}
                                <div className="text-center text-sm text-gray-600">
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