class BaseBus {
    constructor(busData) {
        this.companyName = busData.companyName;
        this.busType = busData.busType;
        this.busNumber = busData.busNumber;
        this.startCity = busData.startCity;
        this.destination = busData.destination;
        this.totalSeats = busData.totalSeats;
        this.availableSeats = busData.availableSeats;
        this.pricePerSeat = busData.pricePerSeat;
    }
}

class ACBus extends BaseBus {
    constructor(busData) {
        super(busData);
        this.features = ["AC", "Recliner Seats"];
    }
}

class NonACBus extends BaseBus {
    constructor(busData) {
        super(busData);
        this.features = ["Fan", "Standard Seats"];
    }
}

class SleeperBus extends BaseBus {
    constructor(busData) {
        super(busData);
        this.features = ["Sleeper Berth", "Curtains"];
    }
}

class BusFactory {
    static createBus(type, busData) {
        const normalizedType = String(type || "").trim().toLowerCase();

        switch (normalizedType) {
            case "ac":
            case "executive":
            case "business class":
                return new ACBus(busData);
            case "non-ac":
            case "standard":
                return new NonACBus(busData);
            case "sleeper":
                return new SleeperBus(busData);
            default:
                return new BaseBus(busData);
        }
    }

    static createFromModel(busDoc) {
        const busData = busDoc.toObject ? busDoc.toObject() : busDoc;
        return BusFactory.createBus(busData.busType, busData);
    }
}

module.exports = BusFactory;
