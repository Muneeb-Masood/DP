class JazzCashStrategy {
    pay(amount) {
        return {
            provider: "JazzCash",
            status: "success",
            message: `Payment of ${amount} processed with JazzCash.`,
        };
    }
}

module.exports = JazzCashStrategy;
