class SeatLockLogger {
    update(eventPayload) {
        if (eventPayload.type === 'seat_locked') {
            console.log(`[SeatLockLogger] Locked seat ${eventPayload.seatNo} on bus ${eventPayload.busId}`);
        }

        if (eventPayload.type === 'seat_unlocked') {
            console.log(`[SeatLockLogger] Unlocked seat ${eventPayload.seatNo} on bus ${eventPayload.busId}`);
        }
    }
}

module.exports = SeatLockLogger;