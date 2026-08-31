import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import dotenv from 'dotenv';
import routes from './routes/index';
import { errorHandler } from './middleware/errorhandler';
import client from 'prom-client';
import responseTime from 'response-time';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();

const app = express();
const server = http.createServer(app);

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 300, 500, 1000, 2000],
});
register.registerMetric(httpRequestDurationMicroseconds);

const httpRequestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});
register.registerMetric(httpRequestCount);

app.use(
  responseTime((req: Request, res: Response, time: number) => {
    if ((req as any).route && (req as any).route.path) {
      httpRequestDurationMicroseconds
        .labels(req.method, (req as any).route.path, String(res.statusCode))
        .observe(time);
      httpRequestCount.labels(req.method, (req as any).route.path, String(res.statusCode)).inc();
    }
  })
);

app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.get('/metrics', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_METRICS_IN_PROD !== 'true') {
    res.status(404).json({ message: 'Metrics disabled in production' });
    return;
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS_IN_PROD === 'true') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Shelta-X API Documentation',
    })
  );
}

app.use('/api/v1', routes);
app.use('/v1/api', routes);
app.use('/api', routes);

app.use(errorHandler);

export { app, server };
