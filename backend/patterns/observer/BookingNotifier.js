class BookingNotifier {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        if (observer && typeof observer.update === 'function') {
            this.observers.push(observer);
        }
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter((item) => item !== observer);
    }

    async notify(eventPayload) {
        const tasks = this.observers.map((observer) => observer.update(eventPayload));
        await Promise.allSettled(tasks);
    }
}

module.exports = BookingNotifier;
