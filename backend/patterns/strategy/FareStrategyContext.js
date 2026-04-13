class FareStrategyContext {
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    calculate(baseFare) {
        if (!this.strategy) {
            throw new Error('Fare strategy is not set.');
        }

        return this.strategy.calculate(baseFare);
    }
}

module.exports = FareStrategyContext;
