class TicketBuilder {
    constructor() {
        this.ticket = {
            isAC: false,
            hasFood: false,
            hasTV: false,
            seatType: "Regular",
        };
    }

    setACOption(isAC) {
        this.ticket.isAC = Boolean(isAC);
        return this;
    }

    setFoodOption(hasFood) {
        this.ticket.hasFood = Boolean(hasFood);
        return this;
    }

    setTVOption(hasTV) {
        this.ticket.hasTV = Boolean(hasTV);
        return this;
    }

    setSeatType(seatType) {
        this.ticket.seatType = seatType || "Regular";
        return this;
    }

    setPassenger(passenger) {
        this.ticket.passenger = passenger;
        return this;
    }

    setBus(busInfo) {
        this.ticket.bus = busInfo;
        return this;
    }

    setBaseFare(baseFare) {
        this.ticket.baseFare = Number(baseFare) || 0;
        return this;
    }

    build() {
        const seatTypeSurchargeMap = {
            Window: 80,
            Aisle: 50,
            Sleeper: 220,
            Regular: 0,
        };

        const optionCharges = {
            acCharge: this.ticket.isAC ? 300 : 0,
            foodCharge: this.ticket.hasFood ? 250 : 0,
            tvCharge: this.ticket.hasTV ? 100 : 0,
            seatTypeSurcharge: seatTypeSurchargeMap[this.ticket.seatType] || 0,
        };

        const addonCost =
            optionCharges.acCharge +
            optionCharges.foodCharge +
            optionCharges.tvCharge +
            optionCharges.seatTypeSurcharge;

        return {
            ...this.ticket,
            addonBreakdown: optionCharges,
            totalFare: this.ticket.baseFare + addonCost,
        };
    }
}

module.exports = TicketBuilder;
