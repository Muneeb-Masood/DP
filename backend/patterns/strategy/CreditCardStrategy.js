class CreditCardStrategy {
    pay(amount) {
        return {
            provider: "CreditCard",
            status: "success",
            message: `Payment of ${amount} processed with Credit Card.`,
        };
    }
}

module.exports = CreditCardStrategy;
