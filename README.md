# 🏥 TeleHealth — Online Healthcare Consultation Platform

> A full-stack telehealth web application built as a showcase project. Connects patients with doctors through real-time video calls and chat, with AI-powered health tools, secure payments, and a complete admin panel.

---

## 🔗 Links

| | |
|---|---|
| 🌐 Live Demo | https://tele-health-hpcr.vercel.app/|
| 🔌 Socket Server | https://tele-health.onrender.com |
| 📦 Repository | https://github.com/jaspreetsingh-19/Tele-Health.git |

---

## 📸 Screenshots

> `<!-- Add screenshots here -->`

---

## ✨ Features

### 👤 Patient
- Sign up / log in with email, Google, or GitHub (JWT-based auth)
- Browse verified doctors and check their availability
- Book appointments by selecting a date and time slot
- Choose consultation type — **Video Call** (full fee) or **Chat** (50% off)
- Pay securely via **Razorpay** — appointment only created after payment success
- Cancel appointments with **automatic refund** to original payment method (5–7 days)
- Join **real-time video consultations** using WebRTC
- **Chat with doctors** in real-time with file/image sharing
- Upload and analyze medical reports with **AI (Google Gemini)**
- Check symptoms using the **AI Symptoms Checker**
- View payment history and appointment receipts
- Manage medical records and profile

### 🩺 Doctor
- Log in with credentials created by admin
- Set weekly **availability slots** (only booked slots appear to patients)
- View all appointments (today, upcoming, past)
- Join **video consultations** and **chat sessions** with patients
- Share files and medical documents in chat
- Write prescriptions and doctor's notes during consultation
- Set follow-up dates
- End consultation and mark as completed
- View earnings dashboard

### 🛡️ Admin
- View and manage all **patients** and **doctors**
- **Create new doctor accounts** and set their login credentials
- Approve or manage doctor profiles
- View **system activity logs**
- Monitor platform usage

### 🤖 AI Features
- **Medical Report Analyzer** — upload a PDF report and get a structured AI analysis (summary, key findings, test results, recommendations, risk factors, normal vs abnormal)
- **AI Symptoms Checker** — describe symptoms and get AI-powered health insights

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| React 19 | UI library |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | Component library |
| Socket.io-client | Real-time communication |
| Recharts / Chart.js | Dashboards and analytics |
| Axios | HTTP client |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Next.js API Routes | REST API |
| Node.js + Socket.io | Signaling server (separate) |
| MongoDB + Mongoose | Database |
| JWT (Jose) | Authentication |
| bcryptjs | Password hashing |
| Razorpay | Payments & refunds |
| Cloudinary | File/image storage |
| Mailtrap | Email (verification, password reset) |
| Google Gemini AI | Report analysis & symptom checking |
| WebRTC | Peer-to-peer video calls |

### Infrastructure
| Service | Usage |
|---|---|
| Vercel | Next.js frontend deployment |
| Render | Socket.io signaling server |
| MongoDB Atlas | Cloud database |
| Cloudinary | Media storage |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│         Next.js App  ←→  Socket.io Client           │
│              ↕                    ↕                  │
│         REST API            WebRTC (P2P)             │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
    ┌──────▼──────┐        ┌──────▼──────┐
    │   Vercel    │        │   Render    │
    │  (Next.js)  │        │ (Socket.io) │
    └──────┬──────┘        └─────────────┘
           │
    ┌──────▼──────────────────────┐
    │         MongoDB Atlas        │
    │  Users, Appointments, Chat   │
    │  Payments, VideoCall, Logs   │
    └─────────────────────────────┘
```

The frontend and API routes are deployed on **Vercel**. The Socket.io signaling server (for real-time chat and WebRTC coordination) runs as a **separate Node.js service on Render**. This separation was necessary because Vercel's serverless functions do not support persistent WebSocket connections.

---

## 📁 Project Structure

```
tele-health/
├── src/
│   ├── app/
│   │   ├── page.jsx                  # Landing page
│   │   ├── auth/                     # Login, signup, OAuth, password reset
│   │   ├── patient/                  # Patient dashboard & features
│   │   │   ├── dashboard/
│   │   │   ├── doctors/              # Browse & book doctors
│   │   │   ├── appointment/          # View & manage appointments
│   │   │   ├── chatWithDoc/          # Real-time chat
│   │   │   ├── videoCallDoc/         # Video consultation
│   │   │   ├── reportAnalyzer/       # AI report analysis
│   │   │   ├── symptoms/             # AI symptom checker
│   │   │   ├── records/              # Medical records
│   │   │   └── payment-history/      # Payment history
│   │   ├── doctor/                   # Doctor dashboard & features
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── availability/         # Set availability slots
│   │   │   ├── chatWithPatient/
│   │   │   ├── videoCallPatient/
│   │   │   └── earning/
│   │   ├── admin/                    # Admin panel
│   │   │   ├── doctors/              # Manage doctors
│   │   │   ├── user/                 # Manage patients
│   │   │   └── logs/                 # Activity logs
│   │   └── api/                      # All API routes
│   │       ├── auth/                 # JWT auth endpoints
│   │       ├── appointments/         # Appointment CRUD
│   │       ├── payments/             # Razorpay integration
│   │       ├── video/                # Video call management
│   │       ├── chat/                 # Chat room management
│   │       ├── analyze-report/       # AI report analysis
│   │       ├── symptom/              # AI symptom checker
│   │       ├── upload/               # Cloudinary file upload
│   │       ├── doctors/              # Doctor listing
│   │       ├── doctor-availability/  # Availability management
│   │       ├── profile/              # Patient & doctor profiles
│   │       ├── earning/              # Doctor earnings
│   │       └── admin/                # Admin routes
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── chat/                     # Chat components
│   │   ├── video/                    # Video call components
│   │   ├── BookingModal.jsx          # Appointment booking flow
│   │   ├── FileUpload.jsx            # File upload component
│   │   └── FileMessage.jsx           # File message renderer
│   ├── models/                       # Mongoose schemas
│   │   ├── user.js
│   │   ├── Appointment.js
│   │   ├── ChatRoom.js
│   │   ├── VideoCall.js
│   │   ├── Payment.js
│   │   ├── DoctorAvailability.js
│   │   ├── doctorEarning.js
│   │   └── logs.js
│   ├── hooks/
│   │   └── useSocket.js              # Socket.io hook
│   ├── lib/
│   │   └── db.js                     # MongoDB connection
│   └── helper/
│       └── getDataFromToken.js       # JWT token helper
├── socket-server.js                  # Standalone Socket.io + WebRTC server
├── server.js                         # Next.js custom server (local dev)
└── .env                              # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account
- Cloudinary account
- Google AI API key (Gemini)
- Mailtrap account
- Google & GitHub OAuth apps (for social login)

### 1. Clone the repository

```bash
git clone https://github.com/jaspreetsingh-19/Tele-Health.git
cd tele-health
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Database
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Mailtrap (Email)
MAILTRAP_TOKEN=your_mailtrap_token

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Run the development servers

**Terminal 1 — Next.js app:**
```bash
npm run dev
```

**Terminal 2 — Socket.io signaling server:**
```bash
node socket-server.js
```

The app will be available at `http://localhost:3000`

---

## ☁️ Deployment

### Frontend — Vercel

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Set `NEXT_PUBLIC_SOCKET_URL` to your Render URL

### Socket Server — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `node socket-server.js`
4. Add environment variables:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   MONGO_URI=your_mongodb_connection_string
   PORT=10000
   ```

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The socket client is configured with auto-reconnect to handle cold starts gracefully.

---

## 🔐 Authentication Flow

```
User submits login → API verifies credentials → JWT token set as HttpOnly cookie
                                                        ↓
All protected routes → middleware checks JWT → getDataFromToken() extracts userId
                                                        ↓
                                              Role-based access (patient/doctor/admin)
```

- Passwords hashed with **bcryptjs**
- Tokens stored as **HttpOnly cookies** (not localStorage)
- Email verification on signup
- Forgot password with reset token via email
- Social login via **Google OAuth** and **GitHub OAuth**

---

## 💳 Payment Flow

```
Patient selects slot → Create Razorpay order (fee stored in order notes)
                                    ↓
                         Razorpay payment gateway
                                    ↓
                    Payment success → verify signature
                                    ↓
                    Appointment created ONLY after verification
                                    ↓
                    Cancellation → automatic refund via Razorpay API
```

- Chat consultations are priced at **50% of the doctor's video fee**
- Refunds are processed automatically and reflected in payment history
- Doctor earnings automatically exclude refunded appointments

---

## 📡 Real-time Architecture

```
Patient joins call → Socket emits join-video-call
                              ↓
                    Server stores session in Map
                              ↓
              Both users connected → emit initiate-webrtc
                              ↓
           Caller creates RTCPeerConnection → sends SDP offer
                              ↓
              Callee receives offer → sends SDP answer
                              ↓
           ICE candidates exchanged → P2P connection established
                              ↓
                    Direct video/audio stream (WebRTC P2P)
```

The Socket.io server acts purely as a **signaling server** — once the WebRTC connection is established, media streams flow directly peer-to-peer without going through the server.

---

## 🤖 AI Features

### Report Analyzer
- Accepts **PDF files** only
- Converts to base64 and sends to **Google Gemini 2.5 Flash**
- Returns structured analysis: Summary, Key Findings, Test Results, Recommendations, Risk Factors, Normal vs Abnormal

### Symptom Checker
- Patient describes symptoms in natural language
- AI provides possible conditions, severity assessment, and recommendations
- Clearly states it is not a replacement for professional medical advice

---

## 📊 Database Models

| Model | Description |
|---|---|
| `User` | Patients, doctors, and admins with role-based profiles |
| `Appointment` | Booking details, status, payment info, time slot |
| `ChatRoom` | Chat room linked to appointment with message history |
| `VideoCall` | Video session with participants and call status |
| `Payment` | Razorpay payment records |
| `DoctorAvailability` | Doctor's available days and time slots |
| `DoctorEarning` | Earnings per appointment (excludes refunds) |
| `Symptom` | AI symptom check records |
| `Log` | Admin activity logs |

---

## 🧪 Key Technical Decisions

| Decision | Reason |
|---|---|
| Separate Socket.io server on Render | Vercel serverless functions don't support persistent WebSocket connections |
| Payment before appointment creation | Prevents ghost appointments if payment fails |
| Socket binds to `0.0.0.0` in production | Required for Railway/Render to expose the port publicly |
| WebRTC with STUN servers only | Free tier — no TURN server; works for most network conditions |
| JWT in HttpOnly cookies | More secure than localStorage — prevents XSS attacks |
| Optimistic UI for messages | Instant feedback without waiting for server acknowledgment |

---

## 🙋 Author

**Jaspreet Singh**
- GitHub: https://github.com/jaspreetsingh-19
- LinkedIn: https://www.linkedin.com/in/jaspreetsingh1900/
- Email: jaspreetsingh7192006@gmail.com

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it as inspiration or reference for your own projects.

```
MIT License — Copyright (c) 2026 Jaspreet Singh
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.
```

---

> Built with ❤️ as a full-stack portfolio project demonstrating real-world healthcare application development.
