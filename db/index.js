import { Pool } from "pg";

// konfigutasi SSL dibawa oleh ?sslmode=no-verify di DAATABASE_URL
// supaya cukup diset di satu tepat (file .env)
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});