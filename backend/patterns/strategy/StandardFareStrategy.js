class StandardFareStrategy {
    calculate(baseFare) {
        return {
            multiplier: 1,
            label: 'Standard',
            amount: Number(baseFare) || 0,
        };
    }
}

module.exports = StandardFareStrategy;
