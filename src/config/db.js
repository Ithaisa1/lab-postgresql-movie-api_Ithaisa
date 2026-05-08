const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'peliculas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err.message)
    process.exit(1)
  }
  release()
  console.log('Conectado a PostgreSQL - Base de datos:', process.env.DB_NAME)
})

module.exports = pool