import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";

const detail = async (c) => {

    const id = Number(c.req.param('id'))

    const token = getCookie(c, 'token')

    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        const { rows } = await pool.query(
            'SELECT id, note, user_id FROM todos WHERE user_id = $1 AND id = $2',
            [user.id, id]
        );
        return c.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err)
        return c.json({ success: false, massage: 'Server error' }, 500);
    }
};

export { detail }