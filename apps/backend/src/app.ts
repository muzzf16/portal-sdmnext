import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use('/api', routes);
app.use(errorHandler);

export default app;
