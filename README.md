# Sistema de Gestión DCC - Tarea 4

Extiende la Tarea 3 incorporando un buscador de actividades y un sistema de evaluación (notas), implementados con Spring Boot y llamadas asíncronas con JavaScript (fetch).

## Características

**Buscador de actividades:**
- Búsqueda automática al escribir 3 o más caracteres (sin botón de búsqueda)
- Busca por nombre de actividad, tipo de actividad y comuna del miembro
- Resalta el texto que coincide con la búsqueda
- Mensaje apropiado cuando no hay resultados
- Muestra: nombre del miembro, día, tipo, comuna, nombre de la actividad

**Evaluación de actividades (notas):**
- Cada actividad muestra su nota actual (promedio) o "-" si no ha sido evaluada
- Botón "Evaluar" que abre un selector con notas de 1 a 7
- Validación de número entero entre 1 y 7, tanto en cliente como en servidor
- Guardado asíncrono en base de datos con fetch
- Actualización del promedio en pantalla sin recargar la página

## Tecnologías utilizadas

- Java 17
- Spring Boot 3.5
- Spring Data JPA / Hibernate
- MySQL (misma base de datos que la Tarea 3)
- Thymeleaf
- HTML5
- CSS3 (reutiliza `styles.css` de la Tarea 3)
- JavaScript (fetch)
- Maven

## Estructura de archivos

```
buscador/
├── pom.xml
├── README.md
├── tabla-nota.sql
└── src/main/
    ├── java/app/
    │   └── App.java              # Entidades, repositorios y controlador
    └── resources/
        ├── application.properties
        ├── static/css/
        │   └── styles.css        # Mismo estilo de la Tarea 3
        └── templates/
            └── buscador.html
```

## Arquitectura

La Tarea 3 (Flask) no se modifica, salvo un nuevo link en `index.html` hacia el buscador. Las nuevas funcionalidades corren en un servicio Spring Boot independiente, en otro puerto, conectado a la misma base de datos.

| Servicio | Puerto | Framework |
|---|---|---|
| Sistema DCC (tareas anteriores) | 5000 | Flask |
| Buscador y evaluación (tarea 4) | 8080 | Spring Boot |

## Instalación y uso

### 1. Crear la tabla de notas

```bash
mysql -u <usuario> -p tarea2 < tabla-nota.sql
```

### 2. Ejecutar el sistema base (Flask)

```bash
python app.py
```

Disponible en `http://127.0.0.1:5000`

### 3. Ejecutar el buscador (Spring Boot)

En otra terminal:

```bash
cd buscador
mvn spring-boot:run
```

Disponible en `http://127.0.0.1:8080/buscador`

Desde el menú principal del sistema (`http://127.0.0.1:5000`) hay un botón "Buscador y evaluación de actividades" que lleva directo a esta página.

## API endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/buscador` | Página HTML del buscador |
| GET | `/api/buscar?q=<texto>` | Busca actividades que coincidan con el texto (mínimo 3 caracteres) |
| POST | `/api/notas/<id_actividad>` | Agrega una nota (1 a 7) a la actividad y retorna el nuevo promedio |

## Requisitos previos

- Java 17 o superior
- Maven 3.6.3 o superior
- MySQL con la base de datos `tarea2` ya creada (Tarea 2/3)
