import 'dotenv/config';
import { Hono } from "hono";
import bcrypt from 'bcryptjs';
import { pool } from './db/index.js';
import { serve } from '@hono/node-server';
import jwt from 'jsonwebtoken';
import { setCookie } from 'hono/cookie';
import { getCookie, setCookie } from 'hono/cookie';

const app = new Hono()

// auth

app.post('/api/register', async (c) => {
    const { username, password } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const { rows } = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );
        return c.json({ succes: true, data: rows[0] }, 201);
    } catch (err) {
    console.error(err)
    return c.json({ succes: false, massage: 'Registrasi gagal' }, 400);
    }


});

app.post('/api/login', async (c) => {
    const { username, password } = await c.req.json();

    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    [0];

    if (!user) {
        return c.json({ success: false, massage: 'Username atau password salah' }, 401);
    }

    const isPassowrdValid = await bcrypt.compare(password, user.password);
    if (!isPassowrdValid) {
        return c.json({ succes: false, massage: 'Username atau password salah' }, 401);
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    setCookie(c, 'token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 3600 });
    return c.json({ success: true, massage: 'Login berhasil' });
});

// Ekspor app afar Vercel mengenalinya sebagai serverless handler
   export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3000;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}