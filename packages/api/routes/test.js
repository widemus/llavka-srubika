function testRoutes(fastify, options, done) {
    
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    fastify.get('/whatismyip', async (request, reply) => {
        return { yourIpIs: request.ip }; 
    });

    done();
}