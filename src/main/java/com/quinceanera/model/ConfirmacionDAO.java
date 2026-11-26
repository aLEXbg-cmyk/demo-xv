package com.quinceanera.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * ========================================================
 * MODELO / DAO: ConfirmacionDAO.java
 * Implementación del patrón Data Access Object en Java.
 * ========================================================
 */
public class ConfirmacionDAO {
    // Almacenamiento en memoria para demostración académica
    private static final List<Invitado> repositorio = new CopyOnWriteArrayList<>();

    static {
        // Inicializar datos demo
        repositorio.add(new Invitado("XV-VAL-1001", "Familia Morales González", 4, true, "5598765432", "¡Muchas felicidades Vale!", "Gala Tradicional", "24/10/2026, 18:30"));
        repositorio.add(new Invitado("XV-VAL-1002", "Dr. Fernando Ruiz & Sra.", 2, true, "5533445566", "Será un honor acompañarte.", "Menú Vegetariano", "25/10/2026, 11:15"));
        repositorio.add(new Invitado("XV-VAL-1003", "Lic. Andrea Salgado", 0, false, "5588990011", "Un fuerte abrazo de felicitación.", "Gala Tradicional", "26/10/2026, 15:40"));
    }

    public List<Invitado> obtenerTodos() {
        return Collections.unmodifiableList(new ArrayList<>(repositorio));
    }

    public void guardar(Invitado invitado) {
        if (!invitado.esValido()) {
            throw new IllegalArgumentException("Datos del invitado inválidos");
        }
        eliminar(invitado.getId());
        repositorio.add(0, invitado);
    }

    public boolean eliminar(String id) {
        return repositorio.removeIf(i -> i.getId().equalsIgnoreCase(id));
    }

    public int obtenerTotalPases() {
        return repositorio.stream().filter(Invitado::isAsistencia).mapToInt(Invitado::getPases).sum();
    }
}
