import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";

const list = async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query(
            'SELECT id, note, user_id FROM todos WHERE user_id =$1 ORDER BY id',
            [user.id]
        );
        return c.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        return c.json({ success: false, massage: 'Server error' }, 500)
    }
};

export { list }