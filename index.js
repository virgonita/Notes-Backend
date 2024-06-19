const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.APP_PORT || 3000;

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);
});

app.use(bodyParser.json());

app.get('/api/notes', (req, res) => {
    connection.query('SELECT * FROM notes', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

app.get('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM notes WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(results[0]);
    });
});

app.post('/api/notes', (req, res) => {
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

app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, datetime, note } = req.body;
    if (!title || !datetime || !note) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query('UPDATE notes SET title = ?, datetime = ?, note = ? WHERE id = ?', [title, datetime, note, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note updated successfully' });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM notes WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
