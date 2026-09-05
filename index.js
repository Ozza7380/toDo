import 'dotenv/config';
import { Hono } from "hono";
import { pool } from './db/index.js';
import { serve } from '@hono/node-server';
import jwt from 'jsonwebtoken';
import { getCookie, setCookie } from 'hono/cookie';
import { register } from './routes/auth/register.route.js';
import { login } from './routes/auth/login.routes.js';
import { me } from './routes/auth/me.routes.js';
import { create } from './routes/todo/create.route.js';
import { logout } from './routes/auth/logout.routes.js';
import { list } from './routes/todo/list.routes.js';


const app = new Hono()

// ===== AUTH ====

//daftar
app.post('/api/register', register);

//login
app.post('/api/login', login);

//cek token/cookies
app.get('/api/me', me);

//logout
app.post('/api/logout', logout);

// ===== TODO =====

// Buat note
app.post('/api/todos', create);

//menampilkan note/list todos
app.get('/api/todos', list);

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





// Ekspor app afar Vercel mengenalinya sebagai serverless handler
export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3001;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}