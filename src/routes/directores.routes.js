const express = require('express')
const peliculaController = require('../controllers/PeliculaController')

const router = express.Router()

// GET /api/directores
router.get('/', peliculaController.obtenerDirectores.bind(peliculaController))

// GET /api/directores/:id/peliculas
router.get('/:id/peliculas', peliculaController.obtenerDirectorConPeliculas.bind(peliculaController))

module.exports = router