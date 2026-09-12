import 'dotenv/config';                                         //baca file env
import { Hono } from "hono";                                    //libary server
import { serve } from '@hono/node-server';                      //menjalankan server lokal
import { register } from './routes/auth/register.route.js';     //api
import { login } from './routes/auth/login.routes.js';          //api
import { me } from './routes/auth/me.routes.js';                //api
import { create } from './routes/todo/create.route.js';         //api
import { logout } from './routes/auth/logout.routes.js';        //api
import { list } from './routes/todo/list.route.js';             //api
import { detail } from './routes/todo/detail.route.js';         // api
import { edit } from './routes/todo/edit.route.js';             // api
import { remove } from './routes/todo/remove.route.js';         // api
import { serveStatic } from '@hono/node-server/serve-static';   // ui

const app = new Hono()

// ===== UI  =====
app.use('/*', serveStatic({ root: './public' }));

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