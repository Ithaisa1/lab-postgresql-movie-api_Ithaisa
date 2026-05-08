const peliculaService = require('../services/PeliculaService')

const obtenerPeliculas = async (req, res, next) => {
  try {
    const data = await peliculaService.obtenerTodas(req.query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const obtenerPelicula = async (req, res, next) => {
  try {
    const data = await peliculaService.obtenerPorId(Number(req.params.id))
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const crearPelicula = async (req, res, next) => {
  try {
    const data = await peliculaService.crear(req.body)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

const actualizarPelicula = async (req, res, next) => {
  try {
    const data = await peliculaService.actualizar(Number(req.params.id), req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const eliminarPelicula = async (req, res, next) => {
  try {
    const data = await peliculaService.eliminar(Number(req.params.id))
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const obtenerResenas = async (req, res, next) => {
  try {
    const data = await peliculaService.obtenerResenas(Number(req.params.id))
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const crearResena = async (req, res, next) => {
  try {
    const data = await peliculaService.crearResena(Number(req.params.id), req.body)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  obtenerPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  obtenerResenas,
  crearResena
}