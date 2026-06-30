package cl.dcc.buscador;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}


@Entity
@Table(name = "actividad")
class Actividad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "id_miembro")
    Integer idMiembro;

    String nombre;
    String tipo;
    String dias;
    String horario;
    String link;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_miembro", insertable = false, updatable = false)
    Miembro miembro;
}

@Entity
@Table(name = "miembro")
class Miembro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String rut;
    String nombre;
    String email;
    String tipo;
    String nivel;
    String detalle;
    String comuna;
}

@Entity
@Table(name = "nota")
class Nota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "actividad_id")
    Integer actividadId;

    Integer nota;
}


interface ActividadRepo extends JpaRepository<Actividad, Integer> {

    @Query("""
        SELECT a FROM Actividad a
        JOIN FETCH a.miembro m
        WHERE LOWER(a.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(a.tipo)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(m.comuna) LIKE LOWER(CONCAT('%', :q, '%'))
        """)
    List<Actividad> buscar(@Param("q") String q);
}

interface NotaRepo extends JpaRepository<Nota, Integer> {

    @Query("SELECT AVG(n.nota) FROM Nota n WHERE n.actividadId = :idActividad")
    Double promedio(@Param("idActividad") Integer idActividad);
}


@Controller
class BuscadorController {

    private final ActividadRepo actividadRepo;
    private final NotaRepo notaRepo;

    BuscadorController(ActividadRepo actividadRepo, NotaRepo notaRepo) {
        this.actividadRepo = actividadRepo;
        this.notaRepo = notaRepo;
    }

    @GetMapping("/buscador")
    public String pagina() {
        return "buscador";
    }

    @GetMapping("/api/buscar")
    @ResponseBody
    public ResponseEntity<?> buscar(@RequestParam String q) {
        if (q == null || q.trim().length() < 3) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Escribe al menos 3 caracteres."));
        }

        List<Map<String, Object>> resultado = new ArrayList<>();

        for (Actividad a : actividadRepo.buscar(q.trim())) {
            Double prom = notaRepo.promedio(a.id);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", a.id);
            item.put("nombre", a.nombre);
            item.put("tipo", a.tipo);
            item.put("dias", a.dias);
            item.put("horario", a.horario);
            item.put("miembroNombre", a.miembro != null ? a.miembro.nombre : "");
            item.put("comuna", a.miembro != null ? a.miembro.comuna : "");
            item.put("nota", prom == null ? null : Math.round(prom * 10.0) / 10.0);

            resultado.add(item);
        }

        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/api/notas/{idActividad}")
    @ResponseBody
    public ResponseEntity<?> agregarNota(@PathVariable Integer idActividad,
                                          @RequestBody Map<String, Object> body) {

        if (!actividadRepo.existsById(idActividad)) {
            return ResponseEntity.status(404).body(Map.of("ok", false, "error", "Actividad no encontrada."));
        }

        int valor;
        try {
            valor = Integer.parseInt(String.valueOf(body.get("nota")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "La nota debe ser un número entero."));
        }

        if (valor < 1 || valor > 7) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "La nota debe estar entre 1 y 7."));
        }

        Nota n = new Nota();
        n.actividadId = idActividad;
        n.nota = valor;
        notaRepo.save(n);

        double promedio = Math.round(notaRepo.promedio(idActividad) * 10.0) / 10.0;
        return ResponseEntity.ok(Map.of("ok", true, "promedio", promedio));
    }
}
