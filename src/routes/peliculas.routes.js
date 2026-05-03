const express = require('express')
const peliculaController = require('../controllers/PeliculaController')

const router = express.Router()

// =====================
// LISTADOS
// =====================

router.get('/', peliculaController.obtenerTodas.bind(peliculaController))

router.get('/paginas/todas', peliculaController.obtenerTodasPaginadas.bind(peliculaController))

// =====================
// CRUD
// =====================

router.post('/', peliculaController.crear.bind(peliculaController))

// ⚠️ rutas con :id SIN regex
router.get('/:id', peliculaController.obtenerPorId.bind(peliculaController))
router.patch('/:id', peliculaController.actualizar.bind(peliculaController))
router.delete('/:id', peliculaController.eliminar.bind(peliculaController))

// =====================
// RESEÑAS
// =====================

router.get('/:id/resenas', peliculaController.obtenerResenas.bind(peliculaController))
router.post('/:id/resenas', peliculaController.crearResena.bind(peliculaController))

// =====================
// BONUS
// =====================

router.post('/:id/calificar', peliculaController.calificar.bind(peliculaController))

module.exports = router