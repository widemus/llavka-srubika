const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function authRoutes(fastify, options) {
    // Register
    fastify.post('/register', async (request, reply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ error: 'Username and password are required' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await fastify.mysql.execute(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                [username, hashedPassword]
            );

            reply.code(201).send({ message: 'User registered successfully', userId: result.insertId });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return reply.code(409).send({ error: 'Username already exists' });
            }
            fastify.log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Login
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ error: 'Username and password are required' });
        }

        try {
            const [rows] = await fastify.mysql.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (rows.length === 0) {
                return reply.code(401).send({ error: 'Invalid credentials' });
            }

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (!match) {
                return reply.code(401).send({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET || 'supersecret', // TODO: Move to env
                { expiresIn: '24h' }
            );

            reply.send({ token, user: { id: user.id, username: user.username, balance: user.balance } });
        } catch (err) {
            fastify.log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}

module.exports = authRoutes;
