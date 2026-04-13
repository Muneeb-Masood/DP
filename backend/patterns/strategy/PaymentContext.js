class PaymentContext {
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    pay(amount) {
        if (!this.strategy) {
            throw new Error("Payment strategy is not set.");
        }

        return this.strategy.pay(amount);
    }
}

module.exports = PaymentContext;
