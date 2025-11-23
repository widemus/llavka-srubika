async function economyRoutes(fastify, options) {
    fastify.post('/economy/claim-daily', {
        preValidation: [fastify.authenticate]
    }, async (request, reply) => {
        const userId = request.user.id;

        try {
            const [rows] = await fastify.mysql.execute(
                'SELECT balance, last_daily_claim FROM users WHERE id = ?',
                [userId]
            );

            if (rows.length === 0) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const user = rows[0];

            // Check balance < 4000
            if (user.balance >= 4000) {
                return reply.code(400).send({ error: 'Balance too high for free claim' });
            }

            // Check last claim > 24h
            if (user.last_daily_claim) {
                const lastClaim = new Date(user.last_daily_claim);
                const now = new Date();
                const diff = now - lastClaim;
                const hours = diff / (1000 * 60 * 60);

                if (hours < 24) {
                    return reply.code(400).send({ error: 'Daily claim already used' });
                }
            }

            // Update balance and last_claim
            await fastify.mysql.execute(
                'UPDATE users SET balance = balance + 2000, last_daily_claim = NOW() WHERE id = ?',
                [userId]
            );

            // Get new balance
            const [updatedRows] = await fastify.mysql.execute(
                'SELECT balance FROM users WHERE id = ?',
                [userId]
            );

            reply.send({ message: 'Claim successful', newBalance: updatedRows[0].balance });

        } catch (err) {
            fastify.log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}

module.exports = economyRoutes;
