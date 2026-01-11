const express = require('express');
const router = express.Router();
const { db } = require('../app');

// Home page
router.get('/', (req, res) => {
    res.render('home.html');
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'AmaniCare Center is running' });
});

module.exports = router;