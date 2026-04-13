const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalyticsEventSchema = new Schema({
    bookingId: {
        type: String,
        required: true,
    },
    passengerName: {
        type: String,
        required: true,
    },
    busNumber: {
        type: String,
        required: true,
    },
    paymentProvider: {
        type: String,
        required: true,
    },
    totalFare: {
        type: Number,
        required: true,
    },
    payableTotal: {
        type: Number,
        required: false,
        default: 0,
    },
    route: {
        type: String,
        required: true,
    },
    recordedAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'analytics_events' });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

module.exports = AnalyticsEvent;
