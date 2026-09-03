import 'dotenv/config';
import { Hono } from "hono";
import bcrypt from 'bcryptjs';
import { pool } from './db/index.js';
import { serve } from '@hono/node-server';

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

// Ekspor app afar Vercel mengenalinya sebagai serverless handler
   export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3000;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}