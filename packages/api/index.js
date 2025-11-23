const fastify = require('fastify')({ logger: true });
const jwt = require('jsonwebtoken');

const start = async () => {
  try {
    // Register CORS
    await fastify.register(require('@fastify/cors'), {
      origin: true // Allow all origins for now (dev)
    });

    // Authentication Decorator
    fastify.decorate('authenticate', async function (request, reply) {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        request.user = decoded;
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    // Register Routes
    await fastify.register(require('./routes/database'));
    await fastify.register(require('./routes/auth'));
    await fastify.register(require('./routes/economy'));
    await fastify.register(require('./routes/shop'));

    await fastify.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0'
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();