import express from 'express';
import path from 'path';
import uploadRouter from './routes/upload';

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// API routes
app.use('/api/upload', uploadRouter);

// Serve static files from React build (production)
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// SPA fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});