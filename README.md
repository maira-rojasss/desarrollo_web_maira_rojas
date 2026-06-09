# Sistema de Gestión DCC - Tarea 3

Aplicación web para el registro y administración de miembros y actividades del Departamento de Ciencias de la Computación (DCC), desarrollada con Flask y SQLAlchemy. Extiende la Tarea 2 incorporando estadísticas visuales y comentarios asincrónicos.

## Características

* Registro de miembros:
  * Estudiantes
  * Funcionarios
  * Académicos
  * Campo de comuna de residencia
* Formularios dinámicos:
  * Campos que cambian según el tipo de miembro
  * Registro de múltiples actividades
  * Selección de múltiples días
* Gestión de actividades:
  * Horario inicio/fin
  * Tipo de actividad
  * Link opcional
  * Vista de detalle por actividad
* Comentarios en actividades (AJAX):
  * Formulario con validación en cliente y servidor
  * Envío asíncrono con `fetch`
  * Listado de comentarios cargado asincrónicamente
* Gestión de imágenes:
  * Subida de múltiples imágenes
  * Imagen obligatoria
  * Validación de formatos permitidos
* Listado de miembros:
  * Filtros por tipo
  * Ordenamiento
  * Paginación
* Vista detalle:
  * Información completa del miembro
  * Actividades registradas con enlaces a su detalle
  * Galería de imágenes
* Estadísticas (AJAX):
  * Gráfico de líneas: miembros registrados por día
  * Gráfico de torta: actividades por tipo
  * Gráfico de barras: actividades por comuna del miembro

## Tecnologías utilizadas

* Python 3
* Flask
* SQLAlchemy ORM
* MySQL
* HTML5
* CSS3
* JavaScript (fetch / AJAX)
* Jinja2
* Highcharts (gráficos)

## Estructura de archivos

```
app.py                  # Aplicación principal Flask
tarea2.sql              # Script SQL con esquema completo

templates/
│
├── base.html
├── index.html
├── registro.html
├── listado.html
├── detalle.html
├── actividad.html
└── estadisticas.html

static/
│
├── css/
│   ├── styles.css
│   └── tarea3.css
├── js/
│   └── app.js
└── uploads/
```

## Instalación y uso

### 1. Crear entorno virtual

```bash
python3 -m venv env
source env/bin/activate
```

### 2. Instalar dependencias

```bash
pip install flask sqlalchemy pymysql filetype werkzeug
```

### 3. Crear la base de datos

Ejecutar el script SQL incluido en el repositorio:

```bash
mysql -u <usuario> -p < tarea2.sql
```

### 4. Ejecutar la aplicación

```bash
python app.py
```

La aplicación estará disponible en:

```
http://127.0.0.1:5000
```

## API endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/comentarios/<id>` | Lista comentarios de una actividad |
| POST | `/api/comentarios/<id>` | Agrega un comentario |
| GET | `/api/stats/miembros_por_dia` | Datos para gráfico de líneas |
| GET | `/api/stats/actividades_por_tipo` | Datos para gráfico de torta |
| GET | `/api/stats/actividades_por_comuna` | Datos para gráfico de barras |
