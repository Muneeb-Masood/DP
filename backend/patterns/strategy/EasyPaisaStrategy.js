class EasyPaisaStrategy {
    pay(amount) {
        return {
            provider: "EasyPaisa",
            status: "success",
            message: `Payment of ${amount} processed with EasyPaisa.`,
        };
    }
}

module.exports = EasyPaisaStrategy;
