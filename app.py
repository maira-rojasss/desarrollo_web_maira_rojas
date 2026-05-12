import os
import re
import uuid
import filetype
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from sqlalchemy import create_engine, String, Integer, Text, DateTime, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, Session, relationship
from typing import Optional, List

# ── Configuración ──────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = "dcc_tarea2_secretkey"

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "static", "uploads")
ALLOWED_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1000 * 1000   # 16 MB

DB_USER     = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST     = "localhost"
DB_PORT     = 3306
DB_NAME     = "tarea2"
CONNECTION_STRING = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


# ── Modelos ORM ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


class Miembro(Base):
    __tablename__ = "miembro"

    id:             Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    rut:            Mapped[str]           = mapped_column(String(20),  nullable=False, unique=True)
    nombre:         Mapped[str]           = mapped_column(String(150), nullable=False)
    email:          Mapped[str]           = mapped_column(String(150), nullable=False)
    tipo:           Mapped[str]           = mapped_column(String(20),  nullable=False)   # estudiante/funcionario/academico
    nivel:          Mapped[Optional[str]] = mapped_column(String(20),  nullable=True)    # solo estudiante
    detalle:        Mapped[Optional[str]] = mapped_column(String(200), nullable=True)    # departamento/unidad
    fecha_registro: Mapped[datetime]      = mapped_column(DateTime,    default=datetime.now)

    actividades: Mapped[List["Actividad"]] = relationship("Actividad", back_populates="miembro", cascade="all, delete-orphan")
    fotos:       Mapped[List["Foto"]]      = relationship("Foto",      back_populates="miembro", cascade="all, delete-orphan")


class Actividad(Base):
    __tablename__ = "actividad"

    id:       Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_miembro: Mapped[int] = mapped_column(Integer, ForeignKey("miembro.id"), nullable=False)
    nombre:   Mapped[str] = mapped_column(String(200), nullable=False)
    tipo:     Mapped[str] = mapped_column(String(50),  nullable=False)
    dias:     Mapped[str] = mapped_column(String(200), nullable=False)   # guardado como CSV
    horario:  Mapped[str] = mapped_column(String(50),  nullable=False)   # "HH:MM - HH:MM"
    link:     Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    miembro: Mapped["Miembro"] = relationship("Miembro", back_populates="actividades")


class Foto(Base):
    __tablename__ = "foto"

    id:          Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_miembro:  Mapped[int] = mapped_column(Integer, ForeignKey("miembro.id"), nullable=False)
    nombre_orig: Mapped[str] = mapped_column(String(300), nullable=False)   # nombre original del cliente
    nombre_srv:  Mapped[str] = mapped_column(String(300), nullable=False)   # nombre guardado en servidor

    miembro: Mapped["Miembro"] = relationship("Miembro", back_populates="fotos")


# ── Helpers ────────────────────────────────────────────────────────────────────
def get_session() -> Session:
    engine = create_engine(CONNECTION_STRING, echo=False)
    return Session(engine)


def validar_rut(rut: str) -> bool:
    """Valida RUT chileno formato 12345678-9 o 12.345.678-9."""
    rut = rut.strip().replace(".", "").replace(" ", "")
    if not re.match(r"^\d{7,8}-[\dkK]$", rut):
        return False
    cuerpo, dv = rut.split("-")
    dv = dv.upper()
    suma, mult = 0, 2
    for c in reversed(cuerpo):
        suma += int(c) * mult
        mult = mult + 1 if mult < 7 else 2
    resto = 11 - (suma % 11)
    esperado = "K" if resto == 10 else ("0" if resto == 11 else str(resto))
    return dv == esperado


def guardar_archivo(file_obj) -> tuple[str, str] | tuple[None, None]:
    """
    Guarda el archivo de forma segura.
    Retorna (nombre_original, nombre_servidor) o (None, None) si es inválido.
    """
    if not file_obj or file_obj.filename == "":
        return None, None

    # Leer primero para verificar magic numbers, luego rebobinar
    header = file_obj.read(261)
    file_obj.seek(0)

    kind = filetype.guess(header)
    if kind is None or kind.mime not in ALLOWED_MIME:
        return None, None

    nombre_orig = secure_filename(file_obj.filename)
    ext = kind.extension
    nombre_srv  = f"{uuid.uuid4().hex}.{ext}"
    ruta        = os.path.join(app.config["UPLOAD_FOLDER"], nombre_srv)
    file_obj.save(ruta)
    return nombre_orig, nombre_srv


def errores_miembro(rut, nombre, email, tipo, nivel, detalle) -> list[str]:
    """Validación server-side del formulario de miembro."""
    errores = []
    if not rut.strip():
        errores.append("El RUT es obligatorio.")
    elif not validar_rut(rut):
        errores.append("El RUT ingresado no es válido.")
    if not nombre.strip():
        errores.append("El nombre es obligatorio.")
    if not email.strip() or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()):
        errores.append("El email no es válido.")
    if tipo not in ("estudiante", "funcionario", "academico"):
        errores.append("Debe seleccionar un tipo de miembro válido.")
    if tipo == "estudiante":
        if nivel not in ("pregrado", "postgrado"):
            errores.append("Debe seleccionar el nivel del estudiante.")
        if not detalle.strip():
            errores.append("El departamento del estudiante es obligatorio.")
    elif tipo == "funcionario":
        if not detalle.strip():
            errores.append("La unidad del funcionario es obligatoria.")
    elif tipo == "academico":
        if not detalle.strip():
            errores.append("El departamento del académico es obligatorio.")
    return errores


def errores_actividad(nombre, tipo, dias, inicio, fin) -> list[str]:
    """Validación server-side del formulario de actividad."""
    errores = []
    tipos_validos = {"deportiva", "artistica", "tecnologica", "social", "recreativa"}
    dias_validos  = {"Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"}
    if not nombre.strip():
        errores.append("El nombre de la actividad es obligatorio.")
    if tipo not in tipos_validos:
        errores.append("Debe seleccionar un tipo de actividad válido.")
    if not dias:
        errores.append("Debe seleccionar al menos un día.")
    elif not all(d in dias_validos for d in dias):
        errores.append("Uno o más días seleccionados son inválidos.")
    if not inicio or not fin:
        errores.append("Debe ingresar hora de inicio y fin.")
    elif inicio >= fin:
        errores.append("La hora de inicio debe ser anterior a la hora de fin.")
    return errores


# ── Rutas ──────────────────────────────────────────────────────────────────────

# Portada
@app.route("/")
def index():
    session = get_session()
    try:
        stmt = select(Miembro).order_by(Miembro.fecha_registro.desc()).limit(5)
        ultimos = session.scalars(stmt).all()
    except Exception:
        ultimos = []
    finally:
        session.close()
    mensaje = request.args.get("mensaje", "")
    return render_template("index.html", ultimos=ultimos, mensaje=mensaje)


# ── Registro de Miembro ─────────────────────────────────────────────────────────
@app.route("/registro", methods=["GET", "POST"])
def registro():
    errores  = []
    form_data = {}   # para repoblar el formulario si hay errores

    if request.method == "POST":
        # Recoger datos del formulario
        rut     = request.form.get("rut",    "").strip()
        nombre  = request.form.get("nombre", "").strip()
        email   = request.form.get("email",  "").strip()
        tipo    = request.form.get("tipo",   "").strip()
        nivel   = request.form.get("nivelEstudiante", "").strip()
        detalle = (request.form.get("departamento", "")
                   or request.form.get("departamentoAcademico", "")
                   or request.form.get("unidad", "")).strip()

        form_data = {"rut": rut, "nombre": nombre, "email": email,
                     "tipo": tipo, "nivel": nivel, "detalle": detalle}

        # Validar servidor
        errores = errores_miembro(rut, nombre, email, tipo, nivel, detalle)

        if not errores:
            session = get_session()
            try:
                # Verificar RUT duplicado
                existe = session.scalars(select(Miembro).where(Miembro.rut == rut)).first()
                if existe:
                    errores.append("Ya existe un miembro con ese RUT.")
                else:
                    miembro = Miembro(
                        rut=rut, nombre=nombre, email=email,
                        tipo=tipo, nivel=nivel or None,
                        detalle=detalle or None,
                        fecha_registro=datetime.now()
                    )
                    session.add(miembro)
                    session.flush()   # para obtener miembro.id

                    # Procesar actividades (puede haber varias)
                    nombres_act = request.form.getlist("nombreAct")
                    tipos_act   = request.form.getlist("tipoAct")
                    dias_act    = request.form.getlist("diasAct")       # JSON list por actividad
                    inicios_act = request.form.getlist("horaInicio")
                    fines_act   = request.form.getlist("horaFin")
                    links_act   = request.form.getlist("linkAct")

                    import json
                    for i, n_act in enumerate(nombres_act):
                        if not n_act.strip():
                            continue
                        t_act  = tipos_act[i]   if i < len(tipos_act)   else ""
                        d_raw  = dias_act[i]    if i < len(dias_act)    else "[]"
                        ini    = inicios_act[i] if i < len(inicios_act) else ""
                        fin    = fines_act[i]   if i < len(fines_act)   else ""
                        link   = links_act[i]   if i < len(links_act)   else ""

                        try:
                            dias_list = json.loads(d_raw)
                        except Exception:
                            dias_list = []

                        act_err = errores_actividad(n_act, t_act, dias_list, ini, fin)
                        if act_err:
                            errores.extend(act_err)
                            session.rollback()
                            break

                        act = Actividad(
                            id_miembro=miembro.id,
                            nombre=n_act.strip(),
                            tipo=t_act,
                            dias=",".join(dias_list),
                            horario=f"{ini} - {fin}",
                            link=link.strip() or None
                        )
                        session.add(act)

                    # Procesar fotos
                    if not errores:
                        archivos = request.files.getlist("archivo")
                        for f in archivos:
                            if f and f.filename:
                                n_orig, n_srv = guardar_archivo(f)
                                if n_orig is None:
                                    errores.append(f"El archivo '{f.filename}' no es una imagen válida (JPG/PNG/GIF/WEBP).")
                                    session.rollback()
                                    break
                                foto = Foto(id_miembro=miembro.id,
                                            nombre_orig=n_orig,
                                            nombre_srv=n_srv)
                                session.add(foto)

                    if not errores:
                        session.commit()
                        return redirect(url_for("index", mensaje="Miembro registrado correctamente."))
            except Exception as e:
                session.rollback()
                errores.append(f"Error al guardar en la base de datos: {str(e)}")
            finally:
                session.close()

    return render_template("registro.html", errores=errores, form_data=form_data)


# ── Listado de Miembros ─────────────────────────────────────────────────────────
MIEMBROS_POR_PAG = 5

@app.route("/listado")
def listado():
    filtro  = request.args.get("filtro",  "todos")
    orden   = request.args.get("orden",   "nombre")
    pagina  = int(request.args.get("pagina", 1))

    if filtro not in ("todos", "estudiante", "funcionario", "academico"):
        filtro = "todos"
    if orden not in ("nombre", "email"):
        orden = "nombre"

    session = get_session()
    try:
        stmt = select(Miembro)
        if filtro != "todos":
            stmt = stmt.where(Miembro.tipo == filtro)
        col = Miembro.nombre if orden == "nombre" else Miembro.email
        stmt = stmt.order_by(col)

        todos      = session.scalars(stmt).all()
        total      = len(todos)
        total_pag  = max(1, -(-total // MIEMBROS_POR_PAG))   # ceil division
        pagina     = max(1, min(pagina, total_pag))
        inicio     = (pagina - 1) * MIEMBROS_POR_PAG
        miembros   = todos[inicio: inicio + MIEMBROS_POR_PAG]
    finally:
        session.close()

    return render_template("listado.html",
                           miembros=miembros, filtro=filtro, orden=orden,
                           pagina=pagina, total_pag=total_pag)


# ── Detalle de Miembro ──────────────────────────────────────────────────────────
@app.route("/miembro/<int:id_miembro>")
def detalle_miembro(id_miembro: int):
    session = get_session()
    try:
        miembro = session.get(Miembro, id_miembro)
        if miembro is None:
            flash("Miembro no encontrado.")
            return redirect(url_for("listado"))
        actividades = miembro.actividades
        fotos       = miembro.fotos
    finally:
        session.close()
    return render_template("detalle.html",
                           miembro=miembro,
                           actividades=actividades,
                           fotos=fotos)


if __name__ == "__main__":
    app.run(debug=True)
