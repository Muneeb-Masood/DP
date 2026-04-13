class EmailService {
    update(eventPayload) {
        // Placeholder for real SMTP/email integration.
        console.log(`[EmailService] Booking confirmed for ${eventPayload.passengerName || 'Passenger'}`);
    }
}

module.exports = EmailService;
