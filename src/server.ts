import app from './app';
import { connectDB } from './config/database';
import { initModels } from './models';
import logger from './utils/logger';
import { seedSuperAdmin } from './utils/seed-admin';

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = '0.0.0.0';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    try {
      await initModels();
      await seedSuperAdmin();
    } catch (dbErr) {
      logger.warn('DB initialization or seed skipped:', (dbErr as Error)?.message || dbErr);
    }

    app.listen(PORT, HOST, () => {
      logger.success(`Shelta-X Backend server running on http://${HOST}:${PORT}`);
      logger.info(`Health check endpoint: http://${HOST}:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
