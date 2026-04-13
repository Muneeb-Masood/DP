class SeatLockManager {
    constructor() {
        if (SeatLockManager.instance) {
            return SeatLockManager.instance;
        }

        this.locks = new Map();
        this.observers = [];
        SeatLockManager.instance = this;
    }

    subscribe(observer) {
        if (observer && typeof observer.update === 'function') {
            this.observers.push(observer);
        }
    }

    async notify(eventPayload) {
        const tasks = this.observers.map((observer) => observer.update(eventPayload));
        await Promise.allSettled(tasks);
    }

    getBusLocks(busId) {
        const busLocks = this.locks.get(String(busId)) || new Map();
        const now = Date.now();
        const activeSeats = [];

        for (const [seatNo, lockData] of busLocks.entries()) {
            if (lockData.expiresAt <= now) {
                busLocks.delete(seatNo);
                continue;
            }
            activeSeats.push(seatNo);
        }

        this.locks.set(String(busId), busLocks);
        return activeSeats;
    }

    isSeatLocked(busId, seatNo) {
        return this.getBusLocks(busId).includes(seatNo);
    }

    lockSeat(busId, seatNo, lockedBy = 'guest', ttlMs = 5 * 60 * 1000) {
        const id = String(busId);
        const busLocks = this.locks.get(id) || new Map();
        const now = Date.now();
        const existing = busLocks.get(seatNo);

        if (existing && existing.expiresAt > now) {
            return { success: false, message: 'Seat is already locked' };
        }

        busLocks.set(seatNo, {
            seatNo,
            lockedBy,
            lockedAt: now,
            expiresAt: now + ttlMs,
        });

        this.locks.set(id, busLocks);
        this.notify({
            type: 'seat_locked',
            busId: id,
            seatNo,
            lockedBy,
            expiresAt: now + ttlMs,
        });

        return { success: true, seatNo, expiresAt: now + ttlMs };
    }

    unlockSeat(busId, seatNo, releasedBy = 'guest') {
        const id = String(busId);
        const busLocks = this.locks.get(id);

        if (!busLocks || !busLocks.has(seatNo)) {
            return { success: true, message: 'Seat already free' };
        }

        busLocks.delete(seatNo);
        this.locks.set(id, busLocks);
        this.notify({
            type: 'seat_unlocked',
            busId: id,
            seatNo,
            releasedBy,
        });

        return { success: true, seatNo };
    }
}

module.exports = new SeatLockManager();
