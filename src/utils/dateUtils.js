export const formatDateForDB = (dateString) => {
    // Parse date string and ensure it's stored correctly in DB
    const date = new Date(dateString + "T00:00:00.000Z")
    return date
}

export const formatDateForDisplay = (date) => {
    // Always format in local timezone
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
    })
}

export const formatDateForInput = (date) => {
    // Format for HTML date input (YYYY-MM-DD)
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const isSameDate = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
}

export const isToday = (date) => {
    const today = new Date()
    return isSameDate(date, today)
}

export const isFutureDate = (date) => {
    const today = new Date()
    const compareDate = new Date(date)
    today.setHours(0, 0, 0, 0)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate > today
}

export const formatTimeForDisplay = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
}

export const generateTimeSlots = (
    startTime = "09:00",
    endTime = "17:00",
    slotDuration = 30,
    breakStart = "13:00",
    breakEnd = "14:00",
) => {
    const slots = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const breakStartTime = new Date(`2000-01-01T${breakStart}:00`)
    const breakEndTime = new Date(`2000-01-01T${breakEnd}:00`)

    let current = new Date(start)

    while (current < end) {
        const slotEnd = new Date(current.getTime() + slotDuration * 60000)

        // Skip break time slots
        if (!(current >= breakStartTime && current < breakEndTime)) {
            slots.push({
                startTime: current.toTimeString().slice(0, 5),
                endTime: slotEnd.toTimeString().slice(0, 5),
                isBooked: false,
            })
        }

        current = slotEnd
    }

    return slots
}

export const generateRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}