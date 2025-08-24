import axios from "axios"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"
import connect from "@/lib/db"
import User from "@/models/user"

export async function GET(req) {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}/login?error=OAuthFailed`)


    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
    })

    const access_token = tokenRes.data.access_token


    const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })

    const { email, name } = userInfo.data

    await connect()
    let user = await User.findOne({ email })

    if (!user) {
        user = await User.create({
            email,
            username: name || email.split("@")[0],
            isVerified: true,
            authProvider: "google"
        })
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.TOKEN_SECRET, {
        expiresIn: "7d"
    })


    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`)
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    return response

}
