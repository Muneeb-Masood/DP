class PeakHourFareStrategy {
    calculate(baseFare) {
        const normalized = Number(baseFare) || 0;
        const multiplier = 1.2;

        return {
            multiplier,
            label: 'Peak Hour',
            amount: Math.round(normalized * multiplier),
        };
    }
}

module.exports = PeakHourFareStrategy;
