var express = require('express');
var router = express.Router();
var bus = require('../models/Buses');
const BookingService = require('../patterns/singleton/BookingService');
const BusFactory = require('../patterns/factory/BusFactory');
const TicketBuilder = require('../patterns/builder/TicketBuilder');
const PaymentContext = require('../patterns/strategy/PaymentContext');
const PaymentStrategyFactory = require('../patterns/strategy/PaymentStrategyFactory');
const FareStrategyContext = require('../patterns/strategy/FareStrategyContext');
const StandardFareStrategy = require('../patterns/strategy/StandardFareStrategy');
const PeakHourFareStrategy = require('../patterns/strategy/PeakHourFareStrategy');
const BookingNotifier = require('../patterns/observer/BookingNotifier');
const EmailService = require('../patterns/observer/EmailService');
const LoggerService = require('../patterns/observer/LoggerService');
const AnalyticsService = require('../patterns/singleton/AnalyticsService');

// Observer setup is done once and reused for all booking events.
const bookingNotifier = new BookingNotifier();
bookingNotifier.subscribe(new EmailService());
bookingNotifier.subscribe(new LoggerService());
bookingNotifier.subscribe(AnalyticsService);

function isPeakHour() {
    const hour = new Date().getHours();
    return (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);
}

function calculateDynamicFare(baseFare, busInfo, ticketOptions = {}) {
    const numericBaseFare = Number(baseFare) || 0;
    const totalSeats = Number(busInfo.totalSeats) || 0;
    const availableSeats = Number(busInfo.availableSeats) || 0;
    const seatsBooked = Math.max(totalSeats - availableSeats, 0);
    const demandRatio = totalSeats > 0 ? seatsBooked / totalSeats : 0;

    const demandMultiplier = demandRatio >= 0.7 ? 1.15 : demandRatio >= 0.4 ? 1.08 : 1;

    const fareContext = new FareStrategyContext();
    fareContext.setStrategy(isPeakHour() ? new PeakHourFareStrategy() : new StandardFareStrategy());
    const timeAdjusted = fareContext.calculate(numericBaseFare);

    const busType = String(busInfo.busType || '').toLowerCase();
    const busTypeMultiplier = busType.includes('sleeper') ? 1.18 : busType.includes('executive') || busType.includes('business') ? 1.1 : 1;

    const dynamicBaseFare = Math.round(timeAdjusted.amount * demandMultiplier * busTypeMultiplier);

    return {
        dynamicBaseFare,
        breakdown: {
            baseFare: numericBaseFare,
            timeMode: timeAdjusted.label,
            timeMultiplier: timeAdjusted.multiplier,
            demandMultiplier,
            busTypeMultiplier,
            adjustedBaseFare: dynamicBaseFare,
        }
    };
}


// router.get('/', (req, res) => {
//     bus.find({ companyName, startCity, totalseats, availableseats }, (err, result) => {
//         if (err) res.send(err)
//         else res.json({ result })
//     })
// })

router.post('/', (req, res) => {
    const startCity = typeof req.body.startCity === 'string' ? req.body.startCity.trim() : '';
    const destination = typeof req.body.destination === 'string' ? req.body.destination.trim() : '';

    if (!startCity || !destination) {
        return res.status(400).json({ status: false, message: "startCity and destination are required", bus: [] });
    }

    bus.find({
        startCity: { $regex: new RegExp(`^${startCity}$`, 'i') },
        destination: { $regex: new RegExp(`^${destination}$`, 'i') }
    }).exec((err, buses) => {
        if (err) {
            res.json({ status: false, message: "error while searching" })
        }
        else res.json({ bus: buses })
    })
})

router.post('/by-id', (req, res) => {

    bus.findOne({ _id: req.body.bId }, (err, bus) => {
        if (err) {
            res.json({ status: false, message: "error while searching with ID" })
        }
        else
            res.json({ bus })
    })
})

router.post('/fare-preview', async (req, res) => {
    const { busId, ticketOptions = {} } = req.body;

    if (!busId) {
        return res.status(400).json({ status: false, message: 'busId is required' });
    }

    try {
        const selectedBus = await bus.findById(busId).exec();

        if (!selectedBus) {
            return res.status(404).json({ status: false, message: 'Bus not found' });
        }

        const typedBus = BusFactory.createFromModel(selectedBus);
        const fareInfo = calculateDynamicFare(typedBus.pricePerSeat, typedBus, ticketOptions);
        const ticket = new TicketBuilder()
            .setACOption(ticketOptions.isAC)
            .setFoodOption(ticketOptions.hasFood)
            .setTVOption(ticketOptions.hasTV)
            .setSeatType(ticketOptions.seatType)
            .setBaseFare(fareInfo.dynamicBaseFare)
            .build();

        const tax = 150;
        const payableTotal = ticket.totalFare + tax;

        return res.status(200).json({
            status: true,
            fare: {
                ...fareInfo.breakdown,
                options: ticket.addonBreakdown,
                addonTotal: ticket.totalFare - fareInfo.dynamicBaseFare,
                tax,
                totalFare: ticket.totalFare,
                payableTotal,
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Unable to calculate fare', error: error.message });
    }
})

// Example usage endpoint for design patterns in booking flow.
router.post('/create', async (req, res) => {
    const {
        busId,
        passengerName,
        paymentMethod,
        ticketOptions = {},
    } = req.body;

    if (!busId || !passengerName) {
        return res.status(400).json({
            status: false,
            message: 'busId and passengerName are required',
        });
    }

    try {
        const selectedBus = await bus.findById(busId).exec();

        if (!selectedBus) {
            return res.status(404).json({ status: false, message: 'Bus not found' });
        }

        // Factory Pattern: create a typed bus object (AC/Non-AC/Sleeper).
        const typedBus = BusFactory.createFromModel(selectedBus);

        // Builder Pattern: compose ticket options step-by-step.
        const fareInfo = calculateDynamicFare(typedBus.pricePerSeat, typedBus, ticketOptions);
        const ticket = new TicketBuilder()
            .setBus({
                busId: selectedBus._id,
                busNumber: typedBus.busNumber,
                busType: typedBus.busType,
                route: `${typedBus.startCity} -> ${typedBus.destination}`,
            })
            .setPassenger({ name: passengerName })
            .setACOption(ticketOptions.isAC)
            .setFoodOption(ticketOptions.hasFood)
            .setTVOption(ticketOptions.hasTV)
            .setSeatType(ticketOptions.seatType)
            .setBaseFare(fareInfo.dynamicBaseFare)
            .build();
        const tax = 150;
        const payableTotal = ticket.totalFare + tax;
        ticket.pricingBreakdown = {
            ...fareInfo.breakdown,
            options: ticket.addonBreakdown,
            addonTotal: ticket.totalFare - fareInfo.dynamicBaseFare,
            tax,
            payableTotal,
        };
        ticket.tax = tax;
        ticket.payableTotal = payableTotal;

        // Strategy Pattern: choose payment behavior dynamically.
        const paymentContext = new PaymentContext();
        paymentContext.setStrategy(PaymentStrategyFactory.create(paymentMethod));
        const paymentResult = paymentContext.pay(ticket.payableTotal);

        // Singleton Pattern: one shared booking service instance.
        const booking = BookingService.createBooking({
            busId: selectedBus._id,
            busNumber: typedBus.busNumber,
            passengerName,
            ticket,
            payment: paymentResult,
        });

        // Observer Pattern: notify email/logger observers.
        await bookingNotifier.notify({
            bookingId: booking.id,
            passengerName,
            busNumber: typedBus.busNumber,
            paymentProvider: paymentResult.provider,
            totalFare: ticket.totalFare,
            payableTotal: ticket.payableTotal,
            route: `${typedBus.startCity} -> ${typedBus.destination}`,
        });

        return res.status(201).json({
            status: true,
            message: 'Booking created successfully',
            booking,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Unable to create booking',
            error: error.message,
        });
    }
})

router.get('/analytics', async (req, res) => {
    try {
        const summary = await AnalyticsService.getSummary();

        return res.status(200).json({
            status: true,
            analytics: {
                ...summary,
                occupancyByRoute: summary.routeBreakdown,
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Unable to fetch analytics', error: error.message });
    }
})

// router.post('/', (req, res) => {
//     let newBus = new bus(req.body)
//     newBus.save((err, bus) => {
//         if (err) console.log(err)
//         else res.status(201).json(bus)
//     })
// })
















module.exports = router;
