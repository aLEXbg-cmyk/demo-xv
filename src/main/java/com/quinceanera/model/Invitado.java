package com.quinceanera.model;

import java.io.Serializable;

/**
 * ========================================================
 * MODELO: Invitado.java
 * Representa la entidad de un invitado en la arquitectura MVC.
 * Compatible con Apache NetBeans y Java Enterprise / Servlets.
 * ========================================================
 */
public class Invitado implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String nombre;
    private int pases;
    private boolean asistencia;
    private String telefono;
    private String mensaje;
    private String menu;
    private String alergias;
    private String cancionDj;
    private String fechaConfirmacion;

    public Invitado() {
    }

    public Invitado(String id, String nombre, int pases, boolean asistencia, String telefono, String mensaje, String menu, String alergias, String cancionDj, String fechaConfirmacion) {
        this.id = id;
        this.nombre = nombre;
        this.pases = pases;
        this.asistencia = asistencia;
        this.telefono = telefono;
        this.mensaje = mensaje;
        this.menu = menu;
        this.alergias = alergias;
        this.cancionDj = cancionDj;
        this.fechaConfirmacion = fechaConfirmacion;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public int getPases() { return pases; }
    public void setPases(int pases) { this.pases = pases; }

    public boolean isAsistencia() { return asistencia; }
    public void setAsistencia(boolean asistencia) { this.asistencia = asistencia; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getMenu() { return menu; }
    public void setMenu(String menu) { this.menu = menu; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }

    public String getCancionDj() { return cancionDj; }
    public void setCancionDj(String cancionDj) { this.cancionDj = cancionDj; }

    public String getFechaConfirmacion() { return fechaConfirmacion; }
    public void setFechaConfirmacion(String fechaConfirmacion) { this.fechaConfirmacion = fechaConfirmacion; }

    /**
     * Valida las reglas de negocio del invitado
     */
    public boolean esValido() {
        return this.nombre != null && this.nombre.trim().length() >= 3 && (!this.asistencia || (this.pases >= 1 && this.pases <= 10));
    }

    @Override
    public String toString() {
        return "Invitado{" +
                "id='" + id + '\'' +
                ", nombre='" + nombre + '\'' +
                ", pases=" + pases +
                ", asistencia=" + asistencia +
                ", menu='" + menu + '\'' +
                ", alergias='" + alergias + '\'' +
                ", cancionDj='" + cancionDj + '\'' +
                '}';
    }
}
