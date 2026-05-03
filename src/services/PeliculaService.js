// src/services/PeliculaService.js
const pool = require('../config/db')
const AppError = require('../utils/AppError')

class PeliculaService {

  // =====================
  // PELÍCULAS - CRUD básico
  // =====================

  /**
   * Obtener todas las películas con filtros opcionales
   * Filtros soportados: ?genero=slug y/o ?buscar=titulo
   */
  async obtenerTodas(filtros = {}) {
    let query = `
      SELECT
        p.id,
        p.titulo,
        p.anio,
        p.nota,
        d.id AS director_id,
        d.nombre AS director,
        g.id AS genero_id,
        g.nombre AS genero,
        g.slug AS genero_slug
      FROM peliculas p
      LEFT JOIN directores d ON p.director_id = d.id
      LEFT JOIN generos g ON p.genero_id = g.id
    `
    const params = []

    // Filtro por género (slug)
    if (filtros.genero) {
      params.push(filtros.genero)
      query += ` WHERE g.slug = $${params.length}`
    }

    // Filtro por búsqueda de texto (ILIKE = case-insensitive)
    if (filtros.buscar) {
      params.push(`%${filtros.buscar}%`)
      params.push(`%${filtros.buscar}%`)
      const buscarIdx1 = params.length - 1
      const buscarIdx2 = params.length
      const condicion = `(p.titulo ILIKE $${buscarIdx1} OR d.nombre ILIKE $${buscarIdx2})`
      query += filtros.genero ? ` AND ${condicion}` : ` WHERE ${condicion}`
    }

    query += ' ORDER BY p.nota DESC NULLS LAST'

    const { rows } = await pool.query(query, params)
    return rows
  }

  /**
   * BONUS 2: Obtener películas con paginación
   * ?pagina=1&limite=3 devuelve { data, total, pagina, totalPaginas }
   */
  async obtenerTodasConPaginacion(filtros = {}, pagina = 1, limite = 5) {
    pagina = Math.max(1, Number(pagina))
    limite = Math.max(1, Math.min(100, Number(limite)))

    const offset = (pagina - 1) * limite

    // Primero: contar total de registros (sin LIMIT)
    let countQuery = 'SELECT COUNT(*) FROM peliculas p LEFT JOIN generos g ON p.genero_id = g.id'
    const countParams = []

    if (filtros.genero) {
      countParams.push(filtros.genero)
      countQuery += ` WHERE g.slug = $${countParams.length}`
    }

    if (filtros.buscar) {
      countParams.push(`%${filtros.buscar}%`)
      countParams.push(`%${filtros.buscar}%`)
      const buscarIdx1 = countParams.length - 1
      const buscarIdx2 = countParams.length
      const condicion = `(p.titulo ILIKE $${buscarIdx1} OR p.titulo ILIKE $${buscarIdx2})`
      countQuery += filtros.genero ? ` AND ${condicion}` : ` WHERE ${condicion}`
    }

    const { rows: countResult } = await pool.query(countQuery, countParams)
    const total = parseInt(countResult[0].count, 10)
    const totalPaginas = Math.ceil(total / limite)

    // Segundo: obtener datos paginados
    let dataQuery = `
      SELECT
        p.id, p.titulo, p.anio, p.nota,
        d.nombre AS director,
        g.nombre AS genero,
        g.slug AS genero_slug
      FROM peliculas p
      LEFT JOIN directores d ON p.director_id = d.id
      LEFT JOIN generos g ON p.genero_id = g.id
    `
    const dataParams = []

    if (filtros.genero) {
      dataParams.push(filtros.genero)
      dataQuery += ` WHERE g.slug = $${dataParams.length}`
    }

    if (filtros.buscar) {
      dataParams.push(`%${filtros.buscar}%`)
      dataParams.push(`%${filtros.buscar}%`)
      const buscarIdx1 = dataParams.length - 1
      const buscarIdx2 = dataParams.length
      const condicion = `(p.titulo ILIKE $${buscarIdx1} OR p.titulo ILIKE $${buscarIdx2})`
      dataQuery += filtros.genero ? ` AND ${condicion}` : ` WHERE ${condicion}`
    }

    dataQuery += ` ORDER BY p.nota DESC NULLS LAST LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`
    dataParams.push(limite, offset)

    const { rows } = await pool.query(dataQuery, dataParams)

    return {
      data: rows,
      total,
      pagina,
      limite,
      totalPaginas,
      tieneSiguiente: pagina < totalPaginas,
      tieneAnterior: pagina > 1
    }
  }

  /**
   * Obtener una película por ID con toda su información
   */
  async obtenerPorId(id) {
    const { rows } = await pool.query(
      `SELECT
        p.id, p.titulo, p.anio, p.nota, p.created_at,
        d.id AS director_id, d.nombre AS director, d.nacionalidad,
        g.id AS genero_id, g.nombre AS genero
       FROM peliculas p
       LEFT JOIN directores d ON p.director_id = d.id
       LEFT JOIN generos g ON p.genero_id = g.id
       WHERE p.id = $1`,
      [id]
    )

    if (rows.length === 0) {
      throw new AppError('Película no encontrada', 404)
    }

    return rows[0]
  }

  /**
   * Crear una nueva película
   */
  async crear(datos) {
    const { titulo, anio, nota, director_id, genero_id } = datos

    // Validaciones
    if (!titulo) throw new AppError('El título es obligatorio', 400)
    if (!anio) throw new AppError('El año es obligatorio', 400)
    if (anio < 1888 || anio > 2100) throw new AppError('Año fuera de rango', 400)
    if (nota !== undefined && (nota < 0 || nota > 10)) {
      throw new AppError('La nota debe estar entre 0 y 10', 400)
    }

    const { rows } = await pool.query(
      `INSERT INTO peliculas (titulo, anio, nota, director_id, genero_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        titulo,
        Number(anio),
        nota ? Number(nota) : null,
        director_id || null,
        genero_id || null
      ]
    )

    return rows[0]
  }

  /**
   * Actualizar una película existente (PATCH)
   */
  async actualizar(id, datos) {
    const pelicula = await this.obtenerPorId(id)

    const { titulo, anio, nota, director_id, genero_id } = datos

    if (nota !== undefined && (nota < 0 || nota > 10)) {
      throw new AppError('La nota debe estar entre 0 y 10', 400)
    }

    const { rows } = await pool.query(
      `UPDATE peliculas
       SET titulo = COALESCE($1, titulo),
           anio = COALESCE($2, anio),
           nota = COALESCE($3, nota),
           director_id = COALESCE($4, director_id),
           genero_id = COALESCE($5, genero_id)
       WHERE id = $6
       RETURNING *`,
      [
        titulo || null,
        anio ? Number(anio) : null,
        nota !== undefined ? Number(nota) : null,
        director_id || null,
        genero_id || null,
        id
      ]
    )

    return rows[0]
  }

  /**
   * Eliminar una película
   */
  async eliminar(id) {
    const { rows } = await pool.query(
      'DELETE FROM peliculas WHERE id = $1 RETURNING *',
      [id]
    )

    if (rows.length === 0) {
      throw new AppError('Película no encontrada', 404)
    }

    return rows[0]
  }

  // =====================
  // ESTADÍSTICAS
  // =====================

  /**
   * Obtener estadísticas globales + desglose por género
   * Usa AVG, MAX, MIN, GROUP BY
   */
  async obtenerEstadisticas() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        ROUND(AVG(nota)::numeric, 2) AS media_nota,
        MAX(nota) AS nota_maxima,
        MIN(nota) AS nota_minima
      FROM peliculas
      WHERE nota IS NOT NULL
    `)

    const { rows: porGenero } = await pool.query(`
      SELECT 
        g.nombre AS genero, 
        COUNT(p.id)::int AS cantidad,
        ROUND(AVG(p.nota)::numeric, 2) AS media_nota
      FROM generos g
      LEFT JOIN peliculas p ON p.genero_id = g.id
      GROUP BY g.id, g.nombre
      ORDER BY cantidad DESC
    `)

    const { rows: porDirector } = await pool.query(`
      SELECT 
        d.nombre AS director, 
        COUNT(p.id)::int AS cantidad,
        ROUND(AVG(p.nota)::numeric, 2) AS media_nota
      FROM directores d
      LEFT JOIN peliculas p ON p.director_id = d.id
      GROUP BY d.id, d.nombre
      ORDER BY cantidad DESC
    `)

    return {
      general: rows[0],
      porGenero,
      porDirector
    }
  }

  // =====================
  // RESEÑAS
  // =====================

  /**
   * Obtener todas las reseñas de una película
   */
  async obtenerResenas(peliculaId) {
    await this.obtenerPorId(peliculaId)

    const { rows } = await pool.query(
      'SELECT * FROM resenas WHERE pelicula_id = $1 ORDER BY created_at DESC',
      [peliculaId]
    )

    return rows
  }

  /**
   * Crear una nueva reseña
   */
  async crearResena(peliculaId, datos) {
    await this.obtenerPorId(peliculaId)

    const { autor, texto, puntuacion } = datos

    // Validaciones
    if (!autor) throw new AppError('El autor es obligatorio', 400)
    if (!texto) throw new AppError('El texto es obligatorio', 400)
    if (!puntuacion || puntuacion < 1 || puntuacion > 10) {
      throw new AppError('La puntuación debe ser entre 1 y 10', 400)
    }

    const { rows } = await pool.query(
      `INSERT INTO resenas (pelicula_id, autor, texto, puntuacion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [peliculaId, autor, texto, Number(puntuacion)]
    )

    return rows[0]
  }

  // =====================
  // BONUS 1: TRANSACCIÓN
  // =====================

  /**
   * BONUS 1: Calificar película (insertar reseña + actualizar nota)
   * Usa una TRANSACCIÓN: si falla una operación, todo se revierte (ROLLBACK)
   */
  async calificarYActualizar(peliculaId, datos) {
    const client = await pool.connect()

    try {
      // Iniciar transacción
      await client.query('BEGIN')

      // 1. Verificar que la película existe
      const { rows: peliculaRows } = await client.query(
        'SELECT * FROM peliculas WHERE id = $1',
        [peliculaId]
      )

      if (peliculaRows.length === 0) {
        await client.query('ROLLBACK')
        throw new AppError('Película no encontrada', 404)
      }

      const { autor, texto, puntuacion } = datos

      // Validaciones
      if (!autor) throw new AppError('El autor es obligatorio', 400)
      if (!texto) throw new AppError('El texto es obligatorio', 400)
      if (!puntuacion || puntuacion < 1 || puntuacion > 10) {
        throw new AppError('La puntuación debe ser entre 1 y 10', 400)
      }

      // 2. Insertar la reseña
      const { rows: resenaRows } = await client.query(
        `INSERT INTO resenas (pelicula_id, autor, texto, puntuacion)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [peliculaId, autor, texto, Number(puntuacion)]
      )

      // 3. Calcular nueva media de reseñas
      const { rows: mediaRows } = await client.query(
        `SELECT ROUND(AVG(puntuacion)::numeric, 1) AS media
         FROM resenas
         WHERE pelicula_id = $1`,
        [peliculaId]
      )

      const nuevaNota = mediaRows[0].media

      // 4. Actualizar nota de la película con la media
      const { rows: peliculaActualizada } = await client.query(
        `UPDATE peliculas
         SET nota = $1
         WHERE id = $2
         RETURNING *`,
        [nuevaNota, peliculaId]
      )

      // ✅ Confirmar la transacción
      await client.query('COMMIT')

      return {
        resena: resenaRows[0],
        peliculaActualizada: peliculaActualizada[0],
        mensaje: `Reseña creada. Nota de película actualizada a ${nuevaNota}`
      }

    } catch (err) {
      // ❌ Revertir si hay error
      await client.query('ROLLBACK')
      throw err

    } finally {
      // Siempre liberar la conexión
      client.release()
    }
  }

  // =====================
  // BONUS 3: DIRECTORES
  // =====================

  /**
   * Obtener todos los directores
   */
  async obtenerDirectores() {
    const { rows } = await pool.query(
      `SELECT id, nombre, nacionalidad, fecha_nac FROM directores ORDER BY nombre`
    )
    return rows
  }

  /**
   * Obtener un director por ID con todas sus películas
   */
  async obtenerDirectorConPeliculas(directorId) {
    const { rows: directorRows } = await pool.query(
      `SELECT id, nombre, nacionalidad, fecha_nac FROM directores WHERE id = $1`,
      [directorId]
    )

    if (directorRows.length === 0) {
      throw new AppError('Director no encontrado', 404)
    }

    const director = directorRows[0]

    const { rows: peliculasRows } = await pool.query(
      `SELECT p.id, p.titulo, p.anio, p.nota, g.nombre AS genero
       FROM peliculas p
       LEFT JOIN generos g ON p.genero_id = g.id
       WHERE p.director_id = $1
       ORDER BY p.anio DESC`,
      [directorId]
    )

    return {
      ...director,
      peliculas: peliculasRows,
      totalPeliculas: peliculasRows.length
    }
  }
}

module.exports = new PeliculaService()