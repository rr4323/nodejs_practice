import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';
import { DB_CONFIG } from './';

// Create a new Sequelize instance
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    dialect: 'postgres', // or 'mysql', 'sqlite', 'mssql'
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // SQLite only
    // storage: 'path/to/database.sqlite',
  }
);

// Test the database connection
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Synchronize all models with the database
const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    logger.info('Database synchronized');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

export { sequelize, testConnection, syncDatabase };

// Export models
export * from '../models/user.model';
