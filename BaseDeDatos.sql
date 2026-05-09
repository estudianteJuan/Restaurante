-- Creación de la base de datos para el taller
CREATE DATABASE IF NOT EXISTS taller_universidad;
USE taller_universidad;

-- Tabla de ejemplo: Estudiantes
CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    codigo_universitario VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100)
);