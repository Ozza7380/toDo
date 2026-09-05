import 'dotenv/config';
import { Hono } from "hono";
import { pool } from './db/index.js';
import { serve } from '@hono/node-server';
import jwt from 'jsonwebtoken';
import { getCookie, setCookie } from 'hono/cookie';
import { register } from './routes/register.route.js';
import { login } from './routes/login.routes.js';


const app = new Hono()

// auth

//daftar
app.post('/api/register', register);

//login
app.post('/api/login', login);

//cek token/cookies
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

// Buat note
app.post('/api/todos', async (c) => {
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
});

//menampilkan note/list todos
app.get('/api/todos', async (c) => {
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
});

//get todo by id
app.get('/api/todos/:id', async (c) => {

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
});

// edit todo
app.put('/api/todos/:id', async (c) => {
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
});

// hapus todo
app.delete('/api/todos/:id', async (c) => {
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
});

//logout
app.post('/api/logout', (c) => {
    //maxAge -1 menyuuruh browser menghapus cookie nya
    setCookie(c, 'token', '', { maxAge: -1 });
    return c.json({ success: true, massage: 'Logout berhasil' })
});



// Ekspor app afar Vercel mengenalinya sebagai serverless handler
export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3001;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}