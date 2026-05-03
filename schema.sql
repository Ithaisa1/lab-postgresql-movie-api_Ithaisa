-- ======================================
-- CREAR BASE DE DATOS
-- ======================================

CREATE DATABASE peliculas_db;

\c peliculas_db

-- ======================================
-- CREAR TABLAS
-- ======================================

-- Tabla de géneros
CREATE TABLE generos (
  id    SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  slug   VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de directores
CREATE TABLE directores (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  nacionalidad VARCHAR(50),
  fecha_nac    DATE
);

-- Tabla principal de películas
CREATE TABLE peliculas (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(255) NOT NULL,
  anio        INTEGER NOT NULL CHECK (anio >= 1888 AND anio <= 2100),
  nota        DECIMAL(3,1) CHECK (nota >= 0 AND nota <= 10),
  director_id INTEGER REFERENCES directores(id) ON DELETE SET NULL,
  genero_id   INTEGER REFERENCES generos(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_peliculas_director ON peliculas(director_id);
CREATE INDEX idx_peliculas_genero ON peliculas(genero_id);

-- Tabla de reseñas
CREATE TABLE resenas (
  id          SERIAL PRIMARY KEY,
  pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  autor       VARCHAR(100) NOT NULL,
  texto       TEXT NOT NULL,
  puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 10),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================
-- INSERTAR DATOS DE PRUEBA
-- ======================================

-- Géneros
INSERT INTO generos (nombre, slug) VALUES
  ('Ciencia Ficción', 'ciencia-ficcion'),
  ('Crimen', 'crimen'),
  ('Fantasía', 'fantasia'),
  ('Thriller', 'thriller'),
  ('Drama', 'drama');

-- Directores
INSERT INTO directores (nombre, nacionalidad, fecha_nac) VALUES
  ('Christopher Nolan', 'Británico', '1970-07-30'),
  ('Quentin Tarantino', 'Estadounidense', '1963-03-27'),
  ('Peter Jackson', 'Neozelandés', '1961-10-31'),
  ('Denis Villeneuve', 'Canadiense', '1967-10-03');

-- Películas
INSERT INTO peliculas (titulo, anio, nota, director_id, genero_id) VALUES
  ('Inception', 2010, 8.8, 1, 1),
  ('The Dark Knight', 2008, 9.0, 1, 4),
  ('Pulp Fiction', 1994, 8.9, 2, 2),
  ('Inglourious Basterds', 2009, 8.3, 2, 2),
  ('El Señor de los Anillos', 2001, 8.8, 3, 3),
  ('Blade Runner 2049', 2017, 8.0, 4, 1),
  ('Dune', 2021, 8.1, 4, 1);

-- Reseñas
INSERT INTO resenas (pelicula_id, autor, texto, puntuacion) VALUES
  (1, 'María García', 'Una obra maestra del cine moderno', 10),
  (1, 'Carlos López', 'Confusa al principio pero brillante', 8),
  (2, 'Ana Martínez', 'El mejor superhéroe del cine', 10),
  (3, 'Luis Fernández', 'Clásico imprescindible', 9),
  (6, 'Carmen Ruiz', 'Visualmente impresionante', 8);