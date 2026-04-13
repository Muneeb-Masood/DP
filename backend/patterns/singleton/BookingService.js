class BookingService {
    constructor() {
        if (BookingService.instance) {
            return BookingService.instance;
        }

        // In-memory booking list for demo usage of the singleton service.
        this.bookings = [];
        BookingService.instance = this;
    }

    createBooking(bookingPayload) {
        const booking = {
            id: `BK-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...bookingPayload,
        };

        this.bookings.push(booking);
        return booking;
    }

    getAllBookings() {
        return this.bookings;
    }
}

module.exports = new BookingService();
