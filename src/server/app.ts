import express from 'express';
import path from 'path';
import uploadRouter from './routes/upload';
import envalid from 'envalid';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Validate and load environment variables
envalid.cleanEnv(process.env, {
  AZURE_STORAGE_ACCOUNT_NAME: envalid.str(),
  AZURE_STORAGE_CONTAINER_NAME: envalid.str(),
  PORT: envalid.port({ default: 3000 }),
  CORS_ORIGIN: envalid.str({ default: '*' }),
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);

// Middleware for parsing JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/upload', uploadRouter);

// Serve static files from React build (production)
const staticDir = path.resolve(__dirname, 'public');
app.use(express.static(staticDir));

// SPA fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Error handling middleware
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});