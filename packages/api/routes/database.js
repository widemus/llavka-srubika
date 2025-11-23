const fp = require('fastify-plugin');
const mysql = require('mysql2/promise');

async function dbConnector(fastify, options) {
  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  // Socket Path 
  if (process.env.DB_SOCKET_PATH) {
    fastify.log.info(`Connecting to Cloud SQL via Socket: ${process.env.DB_SOCKET_PATH}`);
    dbConfig.socketPath = process.env.DB_SOCKET_PATH;
  } 
  // Host/Port
  else {
    fastify.log.info(`Connecting to Database via TCP: ${process.env.DB_HOST}`);
    dbConfig.host = process.env.DB_HOST || '127.0.0.1';
    dbConfig.port = process.env.DB_PORT || 3306;
  }

  try {
    const pool = mysql.createPool(dbConfig);
    // Test connection
    await pool.getConnection();
    
    fastify.decorate('mysql', pool);
    fastify.log.info('Database connected successfully');
  } catch (err) {
    fastify.log.error('Database connection failed');
    fastify.log.error(err);
    process.exit(1);
  }
}

module.exports = fp(dbConnector);