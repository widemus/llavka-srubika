async function shopRoutes(fastify, options) {
    // Get all items
    fastify.get('/shop/items', async (request, reply) => {
        try {
            const [rows] = await fastify.mysql.execute('SELECT * FROM items');
            reply.send(rows);
        } catch (err) {
            fastify.log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Buy item
    fastify.post('/shop/buy', {
        preValidation: [fastify.authenticate]
    }, async (request, reply) => {
        const { itemId } = request.body;
        const userId = request.user.id;

        if (!itemId) {
            return reply.code(400).send({ error: 'Item ID is required' });
        }

        const connection = await fastify.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // Get Item Cost
            const [itemRows] = await connection.execute(
                'SELECT cost FROM items WHERE id = ?',
                [itemId]
            );
            if (itemRows.length === 0) {
                await connection.rollback();
                return reply.code(404).send({ error: 'Item not found' });
            }
            const cost = itemRows[0].cost;

            // Get User Balance
            const [userRows] = await connection.execute(
                'SELECT balance FROM users WHERE id = ? FOR UPDATE',
                [userId]
            );
            if (userRows.length === 0) {
                await connection.rollback();
                return reply.code(404).send({ error: 'User not found' });
            }
            const balance = userRows[0].balance;

            if (balance < cost) {
                await connection.rollback();
                return reply.code(400).send({ error: 'Insufficient funds' });
            }

            // Deduct Balance
            await connection.execute(
                'UPDATE users SET balance = balance - ? WHERE id = ?',
                [cost, userId]
            );

            // Add to User Items
            await connection.execute(
                'INSERT INTO user_items (user_id, item_id) VALUES (?, ?)',
                [userId, itemId]
            );

            await connection.commit();

            // Get new balance
            const [updatedUser] = await connection.execute('SELECT balance FROM users WHERE id = ?', [userId]);

            reply.send({ message: 'Purchase successful', newBalance: updatedUser[0].balance });

        } catch (err) {
            await connection.rollback();
            fastify.log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        } finally {
            connection.release();
        }
    });
}

module.exports = shopRoutes;
