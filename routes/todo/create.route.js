import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";
import { getCookie } from "hono/cookie";

const create = async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { note } = await c.req.json();

        const { rows } = await pool.query(
            'INSERT INTO todos (note, user_id) VALUES ($1, $2) RETURNING id, note, user_id',
            [note, user.id]
        );
        return c.json({ success: true, data: rows[0] }, 201);
    } catch (err) {
        console.error(err);
        return c.json({ success: false, massage: 'server error' }, 500);
    }
};

export { create }