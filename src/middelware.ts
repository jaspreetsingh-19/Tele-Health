// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value || "";

    console.log("🔍 Middleware running for path:", path);
    console.log("🍪 Token exists:", !!token);

    // Public routes (auth pages, homepage, static assets)
    const isPublicPath =
        path === "/" ||
        path.startsWith("/auth/login") ||
        path.startsWith("/auth/signup") ||
        path.startsWith("/auth/verifyemail") ||
        path.startsWith("/pricing") ||
        path.startsWith("/unauthorized") ||
        path.startsWith("/_next") ||
        path.startsWith("/api/auth") || // Allow auth API routes
        path.includes("."); // Static files

    // Role-based route checks
    const isAdminPath = path.startsWith("/admin");
    const isDoctorPath = path.startsWith("/doctor");
    const isPatientPath = path.startsWith("/patient");
    const isProtectedPath = isAdminPath || isDoctorPath || isPatientPath;

    let decoded: JWTPayload | null = null;

    // Decode JWT if token exists
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.TOKEN_SECRET);
            const { payload } = await jwtVerify(token, secret);
            decoded = payload; // { id, email, role, ... }
            console.log("✅ Token decoded successfully. Role:", decoded.role);
        } catch (err: any) {
            console.error("❌ Error decoding token:", err.message);
            // Clear invalid token and redirect to login
            const response = NextResponse.redirect(new URL("/auth/login", request.url));
            response.cookies.set("token", "", {
                expires: new Date(0),
                path: "/",
                httpOnly: true,
            });
            return response;
        }
    }

    // Skip middleware for public paths
    if (isPublicPath && !isProtectedPath) {
        console.log("🚀 Public path, allowing access");
        return NextResponse.next();
    }

    // 1️⃣ Redirect unauthenticated users from protected pages
    if (isProtectedPath && !decoded) {
        console.log("🔒 Protected path without valid token, redirecting to login");
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 2️⃣ Redirect logged-in users away from auth pages
    if ((path.startsWith("/auth/login") || path.startsWith("/auth/signup")) && decoded) {
        console.log("🔄 Logged-in user on auth page, redirecting to dashboard");
        if (decoded.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
        if (decoded.role === "doctor") return NextResponse.redirect(new URL("/doctor", request.url));
        if (decoded.role === "patient") return NextResponse.redirect(new URL("/patient", request.url));
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 3️⃣ Role-based protection for specific dashboards
    if (decoded) {
        if (isAdminPath && decoded.role !== "admin") {
            console.log("❌ Admin access denied for role:", decoded.role);
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        if (isDoctorPath && decoded.role !== "doctor") {
            console.log("❌ Doctor access denied for role:", decoded.role);
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        if (isPatientPath && decoded.role !== "patient") {
            console.log("❌ Patient access denied for role:", decoded.role);
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    // 4️⃣ Redirect authenticated users from homepage to their dashboard
    if (path === "/" && decoded) {
        console.log("🏠 Redirecting authenticated user from homepage to dashboard");
        if (decoded.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
        if (decoded.role === "doctor") return NextResponse.redirect(new URL("/doctor", request.url));
        if (decoded.role === "patient") return NextResponse.redirect(new URL("/patient", request.url));
    }

    console.log("✅ All middleware checks passed, continuing to page");
    return NextResponse.next();
}

// Apply middleware to all routes except API and static files
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
    ],
};
