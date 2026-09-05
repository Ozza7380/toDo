import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";

const edit = async (c) => {
    const id = Number(c.req.param('id'));

    const token = getCookie(c, 'token');

    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const { note } = await c.req.json()

        const user = jwt.verify(token, process.env.JWT_SECRET);

        const { rows } = await pool.query(
            'UPDATE todos SET note = $1 WHERE user_id = $2 AND id = $3 RETURNING id, note, user_id',
            [note, user.id, id]
        );
        return c.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err);
        return c.json({ success: false, massage: 'Server error' }, 500)
    }
};

export { edit }