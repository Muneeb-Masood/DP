const express = require('express');
const SeatLockManager = require('../patterns/singleton/SeatLockManager');
const SeatLockLogger = require('../patterns/observer/SeatLockLogger');

const router = express.Router();

SeatLockManager.subscribe(new SeatLockLogger());

router.get('/:busId', (req, res) => {
    const { busId } = req.params;
    const lockedSeats = SeatLockManager.getBusLocks(busId);

    return res.status(200).json({
        status: true,
        busId,
        lockedSeats,
    });
});

router.post('/lock', (req, res) => {
    const { busId, seatNo, lockedBy } = req.body;

    if (!busId || !seatNo) {
        return res.status(400).json({
            status: false,
            message: 'busId and seatNo are required',
        });
    }

    const result = SeatLockManager.lockSeat(busId, seatNo, lockedBy || 'guest');

    if (!result.success) {
        return res.status(409).json(result);
    }

    return res.status(200).json({
        status: true,
        ...result,
    });
});

router.delete('/unlock', (req, res) => {
    const { busId, seatNo, releasedBy } = req.body;

    if (!busId || !seatNo) {
        return res.status(400).json({
            status: false,
            message: 'busId and seatNo are required',
        });
    }

    const result = SeatLockManager.unlockSeat(busId, seatNo, releasedBy || 'guest');

    return res.status(200).json({
        status: true,
        ...result,
    });
});

module.exports = router;
