const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

const router = express.Router();


//Displays information tailored according to the logged in user
router.get('/profile', (req, res, next) => {
    const token = req.query.secret_token;

    if (!token) {
        return res.status(401).json({ message: 'Missing auth token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({
            user: decoded,
            token,
        });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});

module.exports = router;