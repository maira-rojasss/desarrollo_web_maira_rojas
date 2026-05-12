// ── Campos extra según tipo de miembro (igual que tarea 1) ───────────────────
function mostrarCamposExtra() {
    const tipo = document.getElementById("tipo").value;
    const contenedor = document.getElementById("camposExtra");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (tipo === "estudiante") {
        contenedor.innerHTML = `
            <section>
                <label>Nivel:</label>
                <select id="nivelEstudiante" name="nivelEstudiante">
                    <option value="">Seleccione</option>
                    <option value="pregrado">Pregrado</option>
                    <option value="postgrado">Postgrado</option>
                </select>
            </section>
            <section>
                <label>Departamento:</label>
                <input type="text" id="departamento" name="departamento">
            </section>`;
    } else if (tipo === "funcionario") {
        contenedor.innerHTML = `
            <section>
                <label>Unidad:</label>
                <input type="text" id="unidad" name="unidad">
            </section>`;
    } else if (tipo === "academico") {
        contenedor.innerHTML = `
            <section>
                <label>Departamento:</label>
                <input type="text" id="departamentoAcademico" name="departamentoAcademico">
            </section>`;
    }
}

// ── Contador de bloques de actividad ─────────────────────────────────────────
let contadorAct = 1;

function agregarActividad() {
    const contenedor = document.getElementById("contenedor-actividades");
    const num = contadorAct + 1;
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const checkboxes = dias.map(d =>
        `<label><input type="checkbox" class="dia-check" value="${d}"> ${d}</label>`
    ).join("\n");

    const bloque = document.createElement("div");
    bloque.className = "actividad-bloque";
    bloque.id = `act-${contadorAct}`;
    bloque.innerHTML = `
        <h4>Actividad ${num}
            <button type="button" onclick="eliminarActividad(this)"
                    style="float:right;background:#c0392b;color:white;border:none;
                           padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;">
                ✕ Eliminar
            </button>
        </h4>

        <section>
            <label>Nombre de la actividad:</label>
            <input type="text" name="nombreAct" placeholder="Nombre">
            <span class="error-campo act-err-nombre"></span>
        </section>

        <section>
            <label>Tipo:</label>
            <select name="tipoAct">
                <option value="">Seleccione</option>
                <option value="deportiva">Deportiva</option>
                <option value="artistica">Artística</option>
                <option value="tecnologica">Tecnológica</option>
                <option value="social">Social</option>
                <option value="recreativa">Recreativa</option>
            </select>
        </section>

        <section>
            <label>Días:</label>
            <div class="checkbox-group">
                ${checkboxes}
            </div>
            <input type="hidden" name="diasAct" class="dias-json">
            <span class="error-campo act-err-dias"></span>
        </section>

        <section class="hora-container">
            <div>
                <label>Hora inicio:</label>
                <input type="time" name="horaInicio">
            </div>
            <div>
                <label>Hora fin:</label>
                <input type="time" name="horaFin">
            </div>
        </section>
        <span class="error-campo act-err-hora"></span>

        <section>
            <label>Enlace (opcional):</label>
            <input type="text" name="linkAct" placeholder="https://...">
        </section>`;

    contenedor.appendChild(bloque);
    contadorAct++;
}

function eliminarActividad(btn) {
    btn.closest(".actividad-bloque").remove();
}

// ── Serializar checkboxes de días a campo oculto JSON ────────────────────────
function serializarDias() {
    document.querySelectorAll(".actividad-bloque").forEach(bloque => {
        const checks = bloque.querySelectorAll(".dia-check:checked");
        const selecto = Array.from(checks).map(c => c.value);
        const hidden = bloque.querySelector(".dias-json");
        if (hidden) hidden.value = JSON.stringify(selecto);
    });
}

// ── Validación cliente (replicando lógica de tarea 1) ────────────────────────
function validarRut(rut) {
    rut = rut.trim().replace(/\./g, "").replace(/ /g, "");
    if (!/^\d{7,8}-[\dkK]$/.test(rut)) return false;
    const [cuerpo, dv] = rut.split("-");
    let suma = 0, mult = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * mult;
        mult = mult < 7 ? mult + 1 : 2;
    }
    const resto = 11 - (suma % 11);
    const esperado = resto === 10 ? "K" : (resto === 11 ? "0" : String(resto));
    return dv.toUpperCase() === esperado;
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.innerText = msg;
}

function limpiarError(id) {
    const el = document.getElementById(id);
    if (el) el.innerText = "";
}

// ── Submit ────────────────────────────────────────────────────────────────────
document.getElementById("formMiembro").addEventListener("submit", function (e) {
    serializarDias();   // siempre serializar antes de validar/enviar

    let ok = true;

    // Miembro
    const rut = document.getElementById("rut").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!rut || !validarRut(rut)) {
        mostrarError("err-rut", "Ingrese un RUT válido (ej: 12345678-9).");
        ok = false;
    } else { limpiarError("err-rut"); }

    if (!nombre) {
        mostrarError("err-nombre", "El nombre es obligatorio.");
        ok = false;
    } else { limpiarError("err-nombre"); }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError("err-email", "Ingrese un email válido.");
        ok = false;
    } else { limpiarError("err-email"); }

    if (!tipo) {
        mostrarError("err-tipo", "Seleccione un tipo de miembro.");
        ok = false;
    } else {
        limpiarError("err-tipo");
        if (tipo === "estudiante") {
            const nivel = document.getElementById("nivelEstudiante")?.value;
            const depto = document.getElementById("departamento")?.value.trim();
            if (!nivel) { mostrarError("err-tipo", "Seleccione el nivel del estudiante."); ok = false; }
            if (!depto) { mostrarError("err-tipo", "Ingrese el departamento."); ok = false; }
        } else if (tipo === "funcionario") {
            const unidad = document.getElementById("unidad")?.value.trim();
            if (!unidad) { mostrarError("err-tipo", "Ingrese la unidad."); ok = false; }
        } else if (tipo === "academico") {
            const depto = document.getElementById("departamentoAcademico")?.value.trim();
            if (!depto) { mostrarError("err-tipo", "Ingrese el departamento."); ok = false; }
        }
    }

    // Actividades
    document.querySelectorAll(".actividad-bloque").forEach(bloque => {
        const nAct = bloque.querySelector("[name='nombreAct']").value.trim();
        const tAct = bloque.querySelector("[name='tipoAct']").value;
        const dias = JSON.parse(bloque.querySelector(".dias-json").value || "[]");
        const ini = bloque.querySelector("[name='horaInicio']").value;
        const fin = bloque.querySelector("[name='horaFin']").value;

        const errN = bloque.querySelector(".act-err-nombre");
        const errD = bloque.querySelector(".act-err-dias");
        const errH = bloque.querySelector(".act-err-hora");

        if (!nAct) { if (errN) errN.innerText = "El nombre de la actividad es obligatorio."; ok = false; }
        else { if (errN) errN.innerText = ""; }

        if (!dias.length) { if (errD) errD.innerText = "Seleccione al menos un día."; ok = false; }
        else { if (errD) errD.innerText = ""; }

        if (!ini || !fin) {
            if (errH) errH.innerText = "Ingrese hora de inicio y fin."; ok = false;
        } else if (ini >= fin) {
            if (errH) errH.innerText = "La hora de inicio debe ser anterior a la hora de fin."; ok = false;
        } else { if (errH) errH.innerText = ""; }

        // Tipo vacío no bloquea (puede no tener actividad completa si la fila está vacía)
        // pero si hay nombre, tipo es obligatorio
        if (nAct && !tAct) {
            if (errN) errN.innerText = "Seleccione un tipo de actividad."; ok = false;
        }
    });

    if (!ok) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});
