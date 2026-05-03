// src/controllers/PeliculaController.js
const peliculaService = require('../services/PeliculaService')

class PeliculaController {

  // =====================
  // PELÍCULAS - CRUD
  // =====================

  async obtenerTodas(req, res, next) {
    try {
      const { genero, buscar } = req.query
      const peliculas = await peliculaService.obtenerTodas({ genero, buscar })
      res.json(peliculas)
    } catch (err) {
      next(err)
    }
  }

  /**
   * BONUS 2: Con paginación
   */
  async obtenerTodasPaginadas(req, res, next) {
    try {
      const { genero, buscar, pagina = 1, limite = 5 } = req.query
      const resultado = await peliculaService.obtenerTodasConPaginacion(
        { genero, buscar },
        pagina,
        limite
      )
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params
      const pelicula = await peliculaService.obtenerPorId(Number(id))
      res.json(pelicula)
    } catch (err) {
      next(err)
    }
  }

  async crear(req, res, next) {
    try {
      const datos = req.body
      const nuevaPelicula = await peliculaService.crear(datos)
      res.status(201).json(nuevaPelicula)
    } catch (err) {
      next(err)
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params
      const datos = req.body
      const peliculaActualizada = await peliculaService.actualizar(Number(id), datos)
      res.json(peliculaActualizada)
    } catch (err) {
      next(err)
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params
      const peliculaEliminada = await peliculaService.eliminar(Number(id))
      res.json({ mensaje: 'Película eliminada', pelicula: peliculaEliminada })
    } catch (err) {
      next(err)
    }
  }

  // =====================
  // ESTADÍSTICAS
  // =====================

  async obtenerEstadisticas(req, res, next) {
    try {
      const stats = await peliculaService.obtenerEstadisticas()
      res.json(stats)
    } catch (err) {
      next(err)
    }
  }

  // =====================
  // RESEÑAS
  // =====================

  async obtenerResenas(req, res, next) {
    try {
      const { id } = req.params
      const resenas = await peliculaService.obtenerResenas(Number(id))
      res.json(resenas)
    } catch (err) {
      next(err)
    }
  }

  async crearResena(req, res, next) {
    try {
      const { id } = req.params
      const datos = req.body
      const nuevaResena = await peliculaService.crearResena(Number(id), datos)
      res.status(201).json(nuevaResena)
    } catch (err) {
      next(err)
    }
  }

  // =====================
  // BONUS 1: TRANSACCIÓN
  // =====================

  /**
   * BONUS 1: Calificar película
   * POST /api/peliculas/:id/calificar
   * Body: { autor, texto, puntuacion }
   */
  async calificar(req, res, next) {
    try {
      const { id } = req.params
      const datos = req.body
      const resultado = await peliculaService.calificarYActualizar(Number(id), datos)
      res.status(201).json(resultado)
    } catch (err) {
      next(err)
    }
  }

  // =====================
  // BONUS 3: DIRECTORES
  // =====================

  /**
   * BONUS 3: Obtener todos los directores
   * GET /api/directores
   */
  async obtenerDirectores(req, res, next) {
    try {
      const directores = await peliculaService.obtenerDirectores()
      res.json(directores)
    } catch (err) {
      next(err)
    }
  }

  /**
   * BONUS 3: Obtener un director con sus películas
   * GET /api/directores/:id/peliculas
   */
  async obtenerDirectorConPeliculas(req, res, next) {
    try {
      const { id } = req.params
      const director = await peliculaService.obtenerDirectorConPeliculas(Number(id))
      res.json(director)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new PeliculaController()