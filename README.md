# Sistema de Gestión DCC - Tarea 2

Aplicación web para el registro y administración de miembros y actividades del Departamento de Ciencias de la Computación (DCC), desarrollada con Flask y SQLAlchemy.

## Características

- Registro de miembros:
  - Estudiantes
  - Funcionarios
  - Académicos

- Formularios dinámicos:
  - Campos que cambian según el tipo de miembro
  - Registro de múltiples actividades
  - Selección de múltiples días

- Gestión de actividades:
  - Horario inicio/fin
  - Tipo de actividad
  - Link opcional

- Gestión de imágenes:
  - Subida de múltiples imágenes
  - Imagen obligatoria
  - Validación de formatos permitidos

- Listado de miembros:
  - Filtros por tipo
  - Ordenamiento
  - Paginación

- Vista detalle:
  - Información completa del miembro
  - Actividades registradas
  - Galería de imágenes

---

## Tecnologías utilizadas

- Python 3
- Flask
- SQLAlchemy ORM
- MySQL
- HTML5
- CSS3
- JavaScript
- Jinja2

---

## Estructura de archivos

```text
app.py                  # Aplicación principal Flask

templates/
│
├── base.html
├── index.html
├── registro.html
├── listado.html
└── detalle.html

static/
│
├── css/
├── js/
└── uploads/
```

---

## Instalación y uso

### 1. Crear entorno virtual

```bash
python3 -m venv env
source env/bin/activate
```

### 2. Crear la base de datos

```sql
CREATE DATABASE tarea2;
```

### 3. Ejecutar la aplicación

```bash
python app.py
```

La aplicación estará disponible en:

```text
http://127.0.0.1:5000
```

---

