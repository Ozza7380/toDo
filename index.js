import 'dotenv/config';
import { Hono } from "hono";
import bcrypt from 'bcryptjs';
import { pool } from './db/index.js';
import { serve } from '@hono/node-server';
import jwt from 'jsonwebtoken';
import { getCookie, setCookie } from 'hono/cookie';

const app = new Hono()

// auth

//daftar
app.post('/api/register', async (c) => {
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


});


//login
app.post('/api/login', async (c) => {
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
});

app.get('/api/me', (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return c.json({ success: true, data: user });    
    } catch (err) {
        return c.json({ success: false, massage: 'Token tidak valid' }, 401);
    }
});

// Menyimpan note
app.post('/api/todos', async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try{
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
});

app.post('/api/logout', (c) => {
    //maxAge -1 menyuuruh browser menghapus cookie nya
    setCookie(c, 'token', '', { maxAge: -1 });
    return c.json({ success: true, massage: 'Logout berhasil' })
});

//menampilkan note
app.get('/api/todos', async (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorize' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query(
            'SELECT id, note, user_id FROM todos WHERE user_id =$1 ORDER BY id',
            [user.id]
        );
        return c.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        return c.json({ success: false, massage: 'Server error' })
    }
});

// Ekspor app afar Vercel mengenalinya sebagai serverless handler
   export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3001;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}