import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  logger.info('Health check called');
  res.status(200).json({
    status: 'ok',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export const healthRouter = router;
