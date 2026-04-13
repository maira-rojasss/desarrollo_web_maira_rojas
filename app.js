let miembros = JSON.parse(localStorage.getItem("miembros")) || [];
let actividades = JSON.parse(localStorage.getItem("actividades")) || [];
let paginaActual = 1;
const miembrosPorPagina = 5;

// Lógica de formularios dinámicos
function mostrarCamposExtra() {
    const tipo = document.getElementById("tipo").value;
    const contenedor = document.getElementById("camposExtra");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (tipo === "estudiante") {
        contenedor.innerHTML = `
            <section><label>Nivel:</label><select id="nivelEstudiante">
                <option value="">Seleccione</option><option value="pregrado">Pregrado</option><option value="postgrado">Postgrado</option>
            </select></section>
            <section><label>Departamento:</label><input type="text" id="departamento"></section>`;
    } else if (tipo === "funcionario") {
        contenedor.innerHTML = `<section><label>Unidad:</label><input type="text" id="unidad"></section>`;
    } else if (tipo === "academico") {
        contenedor.innerHTML = `<section><label>Departamento:</label><input type="text" id="departamentoAcademico"></section>`;
    }
}

// Registro de Miembros
let formMiembro = document.getElementById("formMiembro");
if (formMiembro) {
    formMiembro.addEventListener("submit", (e) => {
        e.preventDefault();
        let rut = document.getElementById("rut").value.trim();
        let nombre = document.getElementById("nombre").value.trim();
        let email = document.getElementById("email").value.trim();
        let tipo = document.getElementById("tipo").value;
        let msj = document.getElementById("mensaje");

        let nivel = document.getElementById("nivelEstudiante")?.value || "";
        let detalle = document.getElementById("departamento")?.value ||
            document.getElementById("departamentoAcademico")?.value ||
            document.getElementById("unidad")?.value || "";

        if (!rut || !nombre || !email || !tipo || (tipo === "estudiante" && (!nivel || !detalle))) {
            msj.innerText = "Error: Datos incompletos.";
            return;
        }

        miembros.push({ rut, nombre, email, tipo, nivel, detalle });
        localStorage.setItem("miembros", JSON.stringify(miembros));
        msj.innerText = "Miembro registrado correctamente.";
        formMiembro.reset();
        document.getElementById("camposExtra").innerHTML = "";
    });
}

// Visualización y Paginación
function mostrarMiembros() {
    let lista = document.getElementById("lista");
    if (!lista) return;

    let filtro = document.getElementById("filtroTipo").value;
    let orden = document.getElementById("ordenarPor").value;

    let filtrados = miembros.filter(m => filtro === "todos" || m.tipo === filtro)
        .sort((a, b) => a[orden].localeCompare(b[orden]));

    let totalPag = Math.ceil(filtrados.length / miembrosPorPagina);
    if (paginaActual > totalPag) paginaActual = totalPag || 1;

    let visibles = filtrados.slice((paginaActual - 1) * miembrosPorPagina, paginaActual * miembrosPorPagina);

    lista.innerHTML = visibles.map(m => `
        <div class="miembro-card">
            <strong>${m.nombre}</strong> (${m.tipo})<br>
            <small>${m.rut} | ${m.email}</small><br>
            <small>${m.nivel ? m.nivel + ' | ' : ''} Org: ${m.detalle}</small>
        </div>`).join("") || "<p>Sin registros.</p>";

    document.getElementById("infoPagina").innerText = `Pág ${paginaActual} de ${totalPag || 1}`;
}

function cambiarPagina(d) {
    paginaActual += d;
    mostrarMiembros();
}

// Métricas y Gráficos
function mostrarMetricas() {
    let contenedor = document.getElementById("metricas");
    if (!contenedor) return;

    if (!miembros.length && !actividades.length) {
        contenedor.innerHTML = "<p>Sin datos.</p>";
        return;
    }

    let html = "";
    if (miembros.length) {
        html += `<section class="metrica-seccion"><h3>Miembros (${miembros.length})</h3>`;
        ["estudiante", "funcionario", "academico"].forEach(t => {
            let cant = miembros.filter(m => m.tipo === t).length;
            let porc = (cant / miembros.length * 100).toFixed(1);
            html += `<div class="metric-container"><span class="label-metrica">${t} (${cant})</span>
                     <div class="bar-bg"><div class="bar-fill" style="width:${porc}%"></div></div></div>`;
        });
        html += `</section>`;
    }

    if (actividades.length) {
        html += `<section class="metrica-seccion"><h3>Actividades (${actividades.length})</h3>`;
        ["deportiva", "artistica", "tecnologica", "social", "recreativa"].forEach(t => {
            let cant = actividades.filter(a => a.tipo === t).length;
            let porc = (cant / actividades.length * 100).toFixed(1);
            html += `<div class="metric-container"><span class="label-metrica">${t} (${cant})</span>
                     <div class="bar-bg"><div class="bar-fill-act" style="width:${porc}%"></div></div></div>`;
        });
        html += `</section>`;
    }
    contenedor.innerHTML = html;
}

// Registro de Actividades
let formActividad = document.getElementById("formActividad");
if (formActividad) {
    formActividad.addEventListener("submit", (e) => {
        e.preventDefault();
        let nombre = document.getElementById("nombreAct").value.trim();
        let tipo = document.getElementById("tipoAct").value;
        let dias = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
        let inicio = document.getElementById("horaInicio").value;
        let fin = document.getElementById("horaFin").value;
        let msj = document.getElementById("mensajeAct");

        if (!nombre || !dias.length || !inicio || !fin || inicio >= fin) {
            msj.innerText = "Error: Datos inválidos o incompletos.";
            return;
        }

        actividades.push({ nombre, tipo, dias, horario: `${inicio} - ${fin}` });
        localStorage.setItem("actividades", JSON.stringify(actividades));
        msj.innerText = "Éxito al registrar.";
        formActividad.reset();
    });
}

window.onload = () => {
    if (document.getElementById("lista")) mostrarMiembros();
    if (document.getElementById("metricas")) mostrarMetricas();
};