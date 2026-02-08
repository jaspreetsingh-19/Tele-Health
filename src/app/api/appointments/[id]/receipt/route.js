// app/api/appointments/[appointmentId]/receipt/route.js
import { NextResponse } from 'next/server'
import { getDataFromToken } from '@/helper/getDataFromToken'
import connectDB from '@/lib/db'
import Appointment from '@/models/Appointment'
import User from '@/models/user'

export async function GET(request, { params }) {
    try {
        const userId = await getDataFromToken(request)
        const id = await params.id
        console.log("id is ", id)

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        await connectDB()

        // Get appointment details
        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'username doctorProfile')
            .populate('patientId', 'username patientProfile')

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            )
        }

        // Check if user owns this appointment
        const isPatient = appointment.patientId._id.toString() === userId
        const isDoctor = appointment.doctorId._id.toString() === userId

        if (!isPatient && !isDoctor) {
            return NextResponse.json(
                { error: "Unauthorized to access this receipt" },
                { status: 403 }
            )
        }

        // Check if payment is completed
        if (appointment.paymentStatus !== 'paid') {
            return NextResponse.json(
                { error: "Receipt only available for paid appointments" },
                { status: 400 }
            )
        }

        // Generate receipt data
        const receiptData = {
            receiptId: `RCP-${appointment._id.toString().slice(-8).toUpperCase()}`,
            appointmentId: appointment._id.toString(),
            patientName: appointment.patientId.patientProfile?.fullName || appointment.patientId.username,
            doctorName: appointment.doctorId.doctorProfile?.fullName || appointment.doctorId.username,
            appointmentDate: appointment.appointmentDate,
            consultationFee: appointment.consultationFee,
            paymentId: appointment.paymentId,
            paymentStatus: appointment.paymentStatus,
            paymentDate: appointment.paymentDate || appointment.updatedAt,
            generatedAt: new Date().toISOString()
        }

        // Generate HTML receipt
        const htmlContent = generateReceiptHTML(receiptData)

        // Return HTML that can be printed or saved as PDF by the browser
        return new NextResponse(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="receipt-${receiptData.receiptId}.html"`
            }
        })

    } catch (error) {
        console.error('Receipt generation error:', error)
        return NextResponse.json(
            { error: "Failed to generate receipt" },
            { status: 500 }
        )
    }
}

function generateReceiptHTML(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${data.receiptId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .receipt-id {
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 15px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .payment-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .total-amount {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e9ecef;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #d4edda;
            color: #155724;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .print-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .receipt-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .print-button {
                display: none;
            }
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .header {
                padding: 20px;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Medical Consultation Service</p>
            <div class="receipt-id">${data.receiptId}</div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">Appointment Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Patient Name</div>
                        <div class="info-value">${data.patientName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Doctor Name</div>
                        <div class="info-value">Dr. ${data.doctorName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Appointment Date</div>
                        <div class="info-value">${new Date(data.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Appointment ID</div>
                        <div class="info-value">${data.appointmentId.slice(-8).toUpperCase()}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Payment ID</div>
                        <div class="info-value">${data.paymentId || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Status</div>
                        <div class="info-value">
                            <span class="status-badge status-paid">${data.paymentStatus}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">${new Date(data.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Generated On</div>
                        <div class="info-value">${new Date(data.generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</div>
                    </div>
                </div>
                
                <div class="payment-summary">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Consultation Fee:</span>
                        <span>₹${data.consultationFee}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Taxes & Fees:</span>
                        <span>₹0.00</span>
                    </div>
                    <div class="total-amount">
                        <span>Total Paid:</span>
                        <span>₹${data.consultationFee}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for using our medical consultation service!</p>
            <p>For any queries, please contact our support team.</p>
            <button class="print-button" onclick="window.print()">Print Receipt</button>
        </div>
    </div>
</body>
</html>
    `
}

export async function POST(request, { params }) {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    )
}