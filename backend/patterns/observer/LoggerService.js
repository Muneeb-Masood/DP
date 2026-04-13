class LoggerService {
    update(eventPayload) {
        console.log('[LoggerService] Booking event:', {
            bookingId: eventPayload.bookingId,
            busNumber: eventPayload.busNumber,
            paymentProvider: eventPayload.paymentProvider,
        });
    }
}

module.exports = LoggerService;
