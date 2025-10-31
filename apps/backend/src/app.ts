import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use('/api', routes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, '..', 'public', 'avatars')));
app.use('/documents', express.static(path.join(__dirname, '..', 'public', 'documents')));

app.use(errorHandler);

export default app;
