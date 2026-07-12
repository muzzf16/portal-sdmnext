import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import { requestContextMiddleware } from './middleware/requestContext';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
const envOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = Array.from(new Set([
    'http://localhost:5173',
    'http://192.168.0.210:8081',
    'https://sdm.bprbaperabatang.com',
    ...envOrigins
]));

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(requestContextMiddleware);
app.use('/api', routes);

// Serve static files (Uploaded content)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/documents', express.static(path.join(__dirname, '..', 'public', 'documents')));
app.use('/logos', express.static(path.join(__dirname, '..', 'public', 'logos')));

// Serve React Frontend (Static files from build)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Handle React Routing (SPA Fallback)
app.get('*', (req, res, next) => {
    // Ignore API routes and specific static paths to avoid conflicts
    if (req.path.startsWith('/api') ||
        req.path.startsWith('/uploads') ||
        req.path.startsWith('/documents') ||
        req.path.startsWith('/logos')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(errorHandler);

export default app;
