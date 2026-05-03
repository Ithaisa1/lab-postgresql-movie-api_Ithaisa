// index.js
require('dotenv').config()
const express = require('express')

// ✅ Conectar a BD al iniciar
require('./src/config/db')

const peliculasRoutes = require('./src/routes/peliculas.routes')
const directoresRoutes = require('./src/routes/directores.routes')

const app = express()

// =====================
// MIDDLEWARE
// =====================

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware para loguear requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`)
  next()
})

// =====================
// RUTAS
// =====================

/**
 * Películas (CRUD + Reseñas + Bonus 1 y 2)
 */
app.use('/api/peliculas', peliculasRoutes)

/**
 * Directores (Bonus 3)
 */
app.use('/api/directores', directoresRoutes)

/**
 * GET /api/estadisticas - Estadísticas globales
 */
const peliculaService = require('./src/services/PeliculaService')
app.get('/api/estadisticas', async (req, res, next) => {
  try {
    const stats = await peliculaService.obtenerEstadisticas()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: '✅ Servidor funcionando' })
})

// =====================
// MIDDLEWARE DE ERRORES
// =====================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  })
})

// Manejo global de errores (último middleware)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Error interno del servidor'

  res.status(statusCode).json({
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// =====================
// ESCUCHAR
// =====================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor en http://localhost:${PORT}`)
  console.log(`📚 Rutas disponibles:`)
  console.log(`   GET    /api/peliculas`)
  console.log(`   GET    /api/peliculas/paginas/todas?pagina=1&limite=5`)
  console.log(`   GET    /api/peliculas/:id`)
  console.log(`   POST   /api/peliculas`)
  console.log(`   PATCH  /api/peliculas/:id`)
  console.log(`   DELETE /api/peliculas/:id`)
  console.log(`   GET    /api/peliculas/:id/resenas`)
  console.log(`   POST   /api/peliculas/:id/resenas`)
  console.log(`   POST   /api/peliculas/:id/calificar (BONUS 1)`)
  console.log(`   GET    /api/directores (BONUS 3)`)
  console.log(`   GET    /api/directores/:id/peliculas (BONUS 3)`)
  console.log(`   GET    /api/estadisticas`)
  console.log(`   GET    /health`)
})

module.exports = app