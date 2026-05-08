require('dotenv').config()
require('./config/db')

const express = require('express')
const app = express()

const peliculaService = require('./services/PeliculaService')
const AppError = require('./utils/AppError')

app.use(express.json())

app.get('/api/estadisticas', async (req, res, next) => {
  try {
    const stats = await peliculaService.obtenerEstadisticas()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

const peliculaRoutes = require('./routes/peliculaRoutes')
app.use('/api/peliculas', peliculaRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Error interno del servidor'

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Ruta no encontrada'
  })
})

app.listen(process.env.PORT, () => {
  console.log(`Servidor en http://localhost:${process.env.PORT}`)
})