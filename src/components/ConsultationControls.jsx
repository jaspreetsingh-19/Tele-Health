"use client"
import VideoCallButton from "./VideoCallButton"
import ChatButton from "./ChatButton"

export default function ConsultationControls({ appointment, userRole }) {
    const canJoinConsultation = () => {
        return (
            appointment.status === "scheduled" &&
            appointment.paymentStatus === "paid" &&
            new Date(appointment.appointmentDate) <= new Date()
        )
    }

    if (!canJoinConsultation()) {
        return (
            <div className="text-sm text-muted-foreground">
                Consultation will be available on the appointment date after payment confirmation
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {appointment.consultationType === "video" ? (
                <VideoCallButton roomId={appointment.roomId} />
            ) : (
                <ChatButton roomId={appointment.roomId} />
            )}

            {/* Always show chat option for communication */}
            {appointment.consultationType === "video" && <ChatButton roomId={appointment.roomId} />}
        </div>
    )
}
