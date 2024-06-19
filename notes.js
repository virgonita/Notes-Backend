const express = require('express');
const router = express.Router();
const connection = require('./db');

router.get('/notes', (req, res) => {
    connection.query('SELECT * FROM notes', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});
clear
router.post('/notes', (req, res) => {
    const { title, datetime, note } = req.body;
    if (!title || !datetime || !note) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query('INSERT INTO notes (title, datetime, note) VALUES (?, ?, ?)', [title, datetime, note], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ id: results.insertId, title, datetime, note });
    });
});

module.exports = router;

