const AnalyticsEvent = require('../../models/AnalyticsEvent');

class AnalyticsService {
    constructor() {
        if (AnalyticsService.instance) {
            return AnalyticsService.instance;
        }

        AnalyticsService.instance = this;
    }

    async update(eventPayload) {
        const analyticsEvent = new AnalyticsEvent({
            ...eventPayload,
            recordedAt: new Date(),
        });

        await analyticsEvent.save();
        return analyticsEvent;
    }

    async getEvents(limit = 100) {
        return AnalyticsEvent.find({}).sort({ recordedAt: -1 }).limit(limit).lean();
    }

    async getSummary() {
        const [countResult, revenueResult, routeResult] = await Promise.all([
            AnalyticsEvent.countDocuments({}),
            AnalyticsEvent.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: { $ifNull: ['$payableTotal', '$totalFare'] } },
                    },
                },
            ]),
            AnalyticsEvent.aggregate([
                {
                    $group: {
                        _id: '$route',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 },
                },
            ]),
        ]);

        const totalBookings = countResult || 0;
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const routeBreakdown = {};
        routeResult.forEach((item) => {
            routeBreakdown[item._id || 'Unknown'] = item.count;
        });

        const mostPopularRoute = routeResult[0]?._id || 'N/A';

        return {
            totalBookings,
            totalRevenue,
            mostPopularRoute,
            routeBreakdown,
        };
    }
}

module.exports = new AnalyticsService();
