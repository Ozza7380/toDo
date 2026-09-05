import { pool } from "../../db/index.js";
import bcrypt from "bcryptjs";

const register = async (c) => {
    const { username, password } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const { rows } = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );
        return c.json({ success: true, data: rows[0] }, 201);
    } catch (err) {
        console.error(err)
        return c.json({ success: false, massage: 'Registrasi gagal' }, 400);
    }


}

export {register}