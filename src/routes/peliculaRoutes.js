const express = require('express')
const router = express.Router()
const {
  obtenerPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  obtenerResenas,
  crearResena
} = require('../controllers/peliculaController')

router.get('/', obtenerPeliculas)
router.get('/:id', obtenerPelicula)
router.post('/', crearPelicula)
router.put('/:id', actualizarPelicula)
router.delete('/:id', eliminarPelicula)

router.get('/:id/resenas', obtenerResenas)
router.post('/:id/resenas', crearResena)

module.exports = router
