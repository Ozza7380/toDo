import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";
import { pool } from "../../db/index.js";

const remove = async (c) => {
    const id = Number(c.req.param('id'));

    const token = getCookie(c, 'token');

    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        await pool.query(
            'DELETE FROM todos WHERE user_id=$1 AND id =$2',// fungsi user_id agar tidak bisa menghapus data orang lain
            [user.id, id]
        )
        return c.json({ success: true, massage: 'Berhasil dihapus' });
    } catch (err) {
        console.error(err)
        return c.json({ success: false, massage: 'Server error' }, 500)
    }
};

export { remove }