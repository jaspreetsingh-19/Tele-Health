import axios from "axios";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/models/user";

export async function GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}/login?error=OAuthFailed`);


    const tokenRes = await axios.post("https://github.com/login/oauth/access_token", {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
    }, {
        headers: {
            Accept: "application/json"
        }
    });

    const access_token = tokenRes.data.access_token;

    // Fetch user data
    const userRes = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });

    const email = emailRes.data.find(e => e.primary)?.email;
    const { name, login } = userRes.data;

    await connect();
    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            email,
            username: name || login || email.split("@")[0],
            isVerified: true,
            authProvider: "github"
        });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.TOKEN_SECRET, {
        expiresIn: "7d"
    });

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
