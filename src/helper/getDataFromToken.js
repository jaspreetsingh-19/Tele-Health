import { NextRequest } from "next/server";
import jwt from "jsonwebtoken"

export async function getDataFromToken(request) {


    try {

        const token = request.cookies.get("token")?.value
        console.log("📦 Received token in cookie:", token)
        const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET)

        console.log("🔑 Decoded token:", decodedToken)
        return decodedToken.id
    } catch (error) {
        console.error("Error decoding token:", error)
        throw new Error(error.message)

    }
}