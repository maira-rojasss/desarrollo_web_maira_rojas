# Sistema de Gestión DCC - Tarea 1

Prototipo funcional para el registro de miembros y actividades del departamento, desarrollado con tecnologías web estándar.

## Características
- **Interfaz Moderna:** Diseño minimalista con paleta de colores morados, centrado total y navegación mediante tarjetas.
- **Formularios Dinámicos:** Los campos se adaptan según el tipo de miembro (Estudiante, Funcionario, Académico).
- **Persistencia Local:** Uso de `localStorage` para mantener los datos en el navegador sin necesidad de base de datos externa.
- **Control de Datos:** Listado con filtros, ordenamiento, paginación y visualización de métricas mediante gráficos de barras dinámicos.

## Tecnologías utilizadas
- **HTML5:** Estructura semántica.
- **CSS3:** Flexbox, Grid y diseño responsivo.
- **JavaScript (Vanilla):** Lógica de negocio y manipulación del DOM.

## Estructura de archivos
- `index.html`: Panel principal de navegación.
- `registro.html`: Formulario de ingreso de miembros.
- `actividades.html`: Formulario de ingreso de actividades.
- `listado.html`: Visualización de miembros con filtros.
- `metricas.html`: Estadísticas de participación.
- `styles.css`: Estilos unificados de la aplicación.
- `app.js`: Lógica funcional y persistencia.

## Instalación y Uso
1. Clonar el repositorio.
2. Abrir `index.html` en cualquier navegador moderno.
3. No requiere dependencias ni servidores externos.
