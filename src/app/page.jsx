"use client"
import React, { useState } from 'react';
import {
  Calendar,
  Video,
  MessageCircle,
  Brain,
  FileText,
  Shield,
  Clock,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';


const TelehealthLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter()

  function handleLogin() {
    router.push("/auth/login")

  }
  function handleGetStarted() {
    router.push("/auth/signup")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H+</span>
              </div>
              <span className="text-xl font-bold text-gray-900">HealthConnect</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <button className="text-blue-600 hover:text-blue-700 font-medium" onClick={handleLogin}>Login</button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={handleGetStarted}>
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Features</a>
                <a href="#services" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Services</a>
                <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-blue-600">About</a>
                <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Contact</a>
                <button className="block w-full text-left px-3 py-2 text-blue-600 font-medium">Login</button>
                <button className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg mt-2">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                Healthcare at Your
                <span className="text-blue-600"> Fingertips</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with certified doctors instantly through our comprehensive telehealth platform.
                Book appointments, get AI-powered health insights, and manage your healthcare from anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                  Book Appointment
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Video Consultation</h3>
                    <p className="text-sm text-gray-500">with Dr. Sarah Johnson</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-4">
                  <span className="text-gray-500">Video Call Interface</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-center text-sm font-medium">
                    Connected
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Healthcare Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with personalized care to provide
              you with the best telehealth experience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Appointment Booking</h3>
              <p className="text-gray-600">
                Seamless scheduling system that allows both doctors and patients to book chat or video consultations
                with real-time availability checking.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">HD Video Consultations</h3>
              <p className="text-gray-600">
                Crystal-clear video calls with secure, HIPAA-compliant technology for face-to-face
                consultations from the comfort of your home.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Chat Messaging</h3>
              <p className="text-gray-600">
                Instant messaging with healthcare providers for quick questions, follow-ups,
                and non-urgent medical consultations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Symptom Checker</h3>
              <p className="text-gray-600">
                Advanced AI-powered symptom analysis that provides preliminary health insights
                and helps determine the urgency of your condition.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Report Analyzer</h3>
              <p className="text-gray-600">
                Upload medical reports and get AI-powered analysis with easy-to-understand
                explanations of your test results and recommendations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">HIPAA Compliant</h3>
              <p className="text-gray-600">
                Your health data is protected with enterprise-grade security and full HIPAA
                compliance for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Care Options
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the type of consultation that best fits your needs and schedule.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Appointments</h3>
                  <p className="text-gray-600">
                    Face-to-face consultations with doctors through high-quality video calls.
                    Perfect for detailed examinations and building personal connections with your healthcare provider.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Consultations</h3>
                  <p className="text-gray-600">
                    Quick and convenient text-based consultations for non-urgent questions,
                    prescription refills, and follow-up care.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Health Assistant</h3>
                  <p className="text-gray-600">
                    Get instant symptom analysis and health insights powered by advanced AI
                    to help you understand your condition better.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Analysis</h3>
                  <p className="text-gray-600">
                    Upload lab results, X-rays, or other medical reports for AI-powered analysis
                    with clear explanations in simple terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                  <span className="text-sm text-gray-500">Today</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Dr. Michael Chen</p>
                      <p className="text-sm text-gray-500">General Consultation</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">2:30 PM</p>
                      <p className="text-xs text-blue-600">Video Call</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Dr. Emily Rodriguez</p>
                      <p className="text-sm text-gray-500">Follow-up Chat</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">4:00 PM</p>
                      <p className="text-xs text-green-600">Chat</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all">
                  Schedule New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Certified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Available Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with HealthConnect is simple and straightforward.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Account</h3>
              <p className="text-gray-600">
                Sign up and complete your medical profile with our secure, user-friendly registration process.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book Appointment</h3>
              <p className="text-gray-600">
                Choose your preferred doctor and appointment type - video call or chat consultation
                based on your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Care</h3>
              <p className="text-gray-600">
                Connect with your doctor at the scheduled time and receive personalized healthcare
                from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Health Insights
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Leverage the power of artificial intelligence to better understand your health
                and make informed decisions about your care.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Intelligent Symptom Analysis</h4>
                    <p className="text-gray-600">
                      Describe your symptoms and get AI-powered insights about potential conditions
                      and recommended next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Medical Report Interpretation</h4>
                    <p className="text-gray-600">
                      Upload lab results, imaging reports, or test results for clear,
                      easy-to-understand explanations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Personalized Health Recommendations</h4>
                    <p className="text-gray-600">
                      Receive tailored health advice and lifestyle recommendations based on
                      your medical history and current condition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Health Assistant</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">You: "I've been having headaches and feeling tired lately"</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-800">
                      <strong>AI Assistant:</strong> Based on your symptoms, this could be related to several factors including stress, dehydration, or sleep issues. I recommend:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Ensure adequate hydration (8+ glasses of water daily)</li>
                      <li>• Maintain consistent sleep schedule</li>
                      <li>• Consider booking a consultation if symptoms persist</li>
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                  Try AI Symptom Checker
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your healthcare needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $29<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">2 Video consultations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Unlimited chat consultations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">AI symptom checker</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Basic report analysis</span>
                </li>
              </ul>
              <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Choose Basic
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $199<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Everything in Premium</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Multi-user family accounts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Dedicated account manager</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Custom integrations</span>
                </li>
              </ul>
              <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-700">Professional Healthcare Team</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About HealthConnect
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                HealthConnect is revolutionizing healthcare delivery by making quality medical care
                accessible to everyone, anywhere. Our platform connects patients with certified
                healthcare professionals through secure, user-friendly technology.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Founded by healthcare professionals and technology experts, we understand the
                challenges of traditional healthcare and have built a solution that prioritizes
                patient convenience without compromising on quality of care.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">24/7 Availability</p>
                  <p className="text-sm text-gray-600">Round-the-clock care</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">Secure Platform</p>
                  <p className="text-sm text-gray-600">HIPAA compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who have already discovered the convenience
            and quality of telehealth with HealthConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our platform? Our support team is here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">support@healthconnect.com</p>
              <p className="text-sm text-gray-500 mt-1">Response within 2 hours</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Location</h3>
              <p className="text-gray-600">123 Health Street</p>
              <p className="text-gray-600">Medical District, NY 10001</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H+</span>
                </div>
                <span className="text-lg font-bold">HealthConnect</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making healthcare accessible and convenient for everyone through innovative telehealth solutions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Video Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chat Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Health Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Analysis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealthConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TelehealthLanding;

