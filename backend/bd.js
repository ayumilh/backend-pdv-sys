import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    idleTimeoutMillis: 30000, // 30s sem uso = desconecta
    connectionTimeoutMillis: 5000, // timeout ao tentar conectar
    keepAlive: true, // mantém socket ativo
});
pool.on('error', (err) => {
    console.error('Erro inesperado no pool PostgreSQL:', err);
});
export default pool;
