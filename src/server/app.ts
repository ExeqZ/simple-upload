import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile } from './routes/upload';

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for file uploads
app.post('/upload', upload.array('files'), uploadFile);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});