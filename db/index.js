import { Pool } from "pg";
import { connectionString } from "pg/lib/defaults";

// konfigutasi SSL dibawa oleh ?sslmode=no-verify di DAATABASE_URL
// supaya cukup diset di satu tepat (file .env)
export const Pool = new Pool({
    connectionString: process.env.DATABASE_URL
});