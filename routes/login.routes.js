 import { pool } from "../db/index.js";
 import bcrypt from "bcryptjs";
 import  jwt from "jsonwebtoken";
 import { setCookie } from "hono/cookie";
 
 const login = async (c) => {
    const { username, password } = await c.req.json();

    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const users = rows[0];

    if (!users) {
        return c.json({ success: false, massage: 'Username atau password salah' }, 401);
    }

    const isPassowrdValid = await bcrypt.compare(password, users.password);
    if (!isPassowrdValid) {
        return c.json({ success: false, massage: 'Username atau password salah' }, 401);
    }

    const token = jwt.sign(
        { id: users.id, username: users.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    setCookie(c, 'token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 3600 });
    return c.json({ success: true, massage: 'Login berhasil' });
};

export { login }