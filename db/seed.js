import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './index.js';

async function seed() {
  console.log('Seeding database...');

  // Hapus data lama. Urutan penting: todos dulu karena punya foreign key ke users.
  await pool.query('DELETE FROM todos');
  await pool.query('DELETE FROM users');

  // Password tidak pernah disimpan apa adanya, melainkan di-hash dulu.
  const hashedPassword = await bcrypt.hash('password123', 10);

  const { rows } = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
    ['andi', hashedPassword]
  );
  const userId = rows[0].id;

  await pool.query(
    'INSERT INTO todos (note, user_id) VALUES ($1, $2), ($3, $4)',
    ['Belajar SQL dan Postgres', userId, 'Membuat API dengan Hono', userId]
  );

  console.log('✅ Seeding completed!');
}

send()
.catch((err) => {
    console.error("Seeding Failed: ", err.massage);
    process.exitCode = 1;
})
.finally(() => pool.end());