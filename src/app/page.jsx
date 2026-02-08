"use client"
import { useState } from "react";
import { 
  Video, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Brain, 
  FileText, 
  Users, 
  Lock, 
  Zap, 
  ChevronRight,
  Stethoscope,
  Clock,
  CheckCircle,
  ArrowRight,
  Server,
  Wifi,
  Database,
  Code
} from "lucide-react";
import { useRouter } from "next/navigation"


const Index = () => {

  const router = useRouter()

  function handleLogin() {
    router.push("/auth/login")

  }
  function handleGetStarted() {
    router.push("/auth/signup")
  }


  const features = [
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      description: "Instant messaging with healthcare providers using WebSocket technology for seamless communication.",
    },
    {
      icon: Video,
      title: "Video Consultations",
      description: "Secure, HD video calls powered by WebRTC for face-to-face consultations from anywhere.",
    },
    {
      icon: Brain,
      title: "AI Symptom Checker",
      description: "AI-powered symptom analysis tool that provides educational health guidance and suggestions.",
    },
    {
      icon: FileText,
      title: "Report Analyzer",
      description: "AI assistant that helps summarize and explain medical reports in simple terms.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intuitive appointment booking system with automated reminders and calendar sync.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure patient and doctor portals with appropriate access controls and permissions.",
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up as a patient or healthcare provider with secure authentication.",
      icon: Users
    },
    {
      step: "02",
      title: "Book Consultation",
      description: "Browse available doctors and schedule an appointment at your convenience.",
      icon: Calendar
    },
    {
      step: "03",
      title: "Connect & Consult",
      description: "Join your video call or chat session for your remote healthcare consultation.",
      icon: Video
    }
  ];

  const techStack = [
    { name: "WebRTC", description: "Real-time video communication", icon: Wifi },
    { name: "WebSockets", description: "Instant messaging", icon: Zap },
    { name: "AI/ML", description: "Intelligent analysis", icon: Brain },
    { name: "Secure Auth", description: "Protected access", icon: Lock },
    { name: "Cloud Infrastructure", description: "Scalable backend", icon: Server },
    { name: "Modern Stack", description: "React & Node.js", icon: Code }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 3s; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Tele-Health</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-500 hover:text-slate-800 transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-500 hover:text-slate-800 transition-colors">How It Works</a>
              
              <a href="#tech" className="text-slate-500 hover:text-slate-800 transition-colors">Technology</a>
            </div>
            <div className="flex items-center gap-3">
              <button href="/login" className="px-5 py-2.5 text-slate-800 font-medium hover:text-blue-600 transition-colors"
              onClick={handleLogin}
              >

                Login
              </button>
              <button href="/get-started" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-teal-50/30" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">Portfolio Demo Project</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                Healthcare
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500"> Reimagined</span>
                <br />for the Digital Age
              </h1>
              
              <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                A modern telehealth platform enabling seamless patient-doctor consultations through secure video calls, real-time messaging, and AI-powered health tools.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2">
                  Explore Features
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-500">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-500">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-500">Real-Time</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Video Consultation</p>
                      <p className="text-white font-semibold text-lg">Dr. Mohan</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white text-sm">Live</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-2xl rounded-tl-none p-4">
                      <p className="text-slate-700 text-sm">How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 max-w-xs">
                      <p className="text-white text-sm">I'd like to discuss my recent test results.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Consultation in progress...</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Connection</p>
                    <p className="text-sm font-semibold text-slate-700">End-to-End Encrypted</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">AI Assistant</p>
                    <p className="text-sm font-semibold text-slate-700">Ready to Help</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mt-4 mb-6">How It Works</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Get started with remote healthcare consultations in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                  <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-500">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-blue-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Platform Capabilities</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mt-4 mb-6">Key Features</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Comprehensive telehealth features designed for seamless remote healthcare delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-2xl p-6 border border-slate-200 transition-all duration-300 hover:shadow-lg`}
                
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* AI Features Highlight */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 rounded-3xl p-8 lg:p-12 border border-blue-100">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">AI-Powered Tools</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">Intelligent Health Assistance</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Our demo showcases AI-powered features including a symptom checker and medical report analyzer. 
                  These tools demonstrate how AI can assist in healthcare education and preliminary guidance.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-slate-700">AI Symptom Checker for educational guidance</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-slate-700">Medical Report Summarization</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-slate-700">Natural language health queries</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">AI Symptom Checker</p>
                    <p className="text-xs text-slate-400">Educational Demo</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-100 rounded-xl p-3">
                    <p className="text-sm text-slate-400">User Input:</p>
                    <p className="text-slate-700">"I've been experiencing headaches and fatigue"</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">AI Analysis:</p>
                    <p className="text-sm text-slate-700">Based on your symptoms, common causes may include stress, dehydration, or sleep issues. Please consult a healthcare provider for proper evaluation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* Technology Stack */}
      <section id="tech" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Built With Modern Tech</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mt-4 mb-6">Technology Stack</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Powered by cutting-edge technologies for reliable, scalable telehealth experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <tech.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{tech.name}</h4>
                <p className="text-xs text-slate-400">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Explore?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover how modern telehealth technology can transform remote healthcare delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              Explore Demo
              <ArrowRight className="w-5 h-5" />
            </button>
           
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-700">⚠️ Important Disclaimer</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            This is a <strong className="text-slate-700">portfolio demonstration project</strong> and is not a live medical service. 
            The AI features are for educational and demonstration purposes only and do not provide real medical advice. 
            Always consult qualified healthcare professionals for medical concerns.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Tele-Health</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Tele-Health Demo. A portfolio project showcasing telehealth technology.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">GitHub</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">LinkedIn</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
