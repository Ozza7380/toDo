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
import { list } from './routes/todo/list.route.js';
import { detail } from './routes/todo/detail.route.js';
import { edit } from './routes/todo/edit.route.js';
import { remove } from './routes/todo/remove.route.js';


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
app.get('/api/todos/:id', detail);

// edit todo
app.put('/api/todos/:id', edit);

// hapus todo
app.delete('/api/todos/:id', remove);





// Ekspor app afar Vercel mengenalinya sebagai serverless handler
export default app;

// jalankan server ini hanya di lingkungan lokal (bukan vercel)
if (!process.env.VERCEL) {
    const port = 3001;
    console.log(`Server Berjalan Di "http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}