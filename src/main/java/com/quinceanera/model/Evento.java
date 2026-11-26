package com.quinceanera.model;

import java.io.Serializable;
import java.util.Date;

/**
 * ========================================================
 * MODELO: Evento.java
 * Encapsula la información oficial del evento de XV Años.
 * ========================================================
 */
public class Evento implements Serializable {
    private static final long serialVersionUID = 1L;

    private String nombreQuinceanera = "Lizette Guadalupe Esparza Díaz";
    private String fechaTexto = "16 de Enero";
    private String lugarCeremonia = "Parroquia de San Juan Bautista";
    private String horaCeremonia = "17:00 hrs";
    private String lugarRecepcion = "Hacienda Real Los Rosales - Salón Cristal";
    private String horaRecepcion = "19:30 hrs";
    private String codigoVestimenta = "Elegante";
    private String telefonoContacto = "+52 477 206 7395";

    public Evento() {}

    public String getNombreQuinceanera() { return nombreQuinceanera; }
    public void setNombreQuinceanera(String nombreQuinceanera) { this.nombreQuinceanera = nombreQuinceanera; }

    public String getFechaTexto() { return fechaTexto; }
    public void setFechaTexto(String fechaTexto) { this.fechaTexto = fechaTexto; }

    public String getLugarCeremonia() { return lugarCeremonia; }
    public void setLugarCeremonia(String lugarCeremonia) { this.lugarCeremonia = lugarCeremonia; }

    public String getHoraCeremonia() { return horaCeremonia; }
    public void setHoraCeremonia(String horaCeremonia) { this.horaCeremonia = horaCeremonia; }

    public String getLugarRecepcion() { return lugarRecepcion; }
    public void setLugarRecepcion(String lugarRecepcion) { this.lugarRecepcion = lugarRecepcion; }

    public String getHoraRecepcion() { return horaRecepcion; }
    public void setHoraRecepcion(String horaRecepcion) { this.horaRecepcion = horaRecepcion; }

    public String getCodigoVestimenta() { return codigoVestimenta; }
    public void setCodigoVestimenta(String codigoVestimenta) { this.codigoVestimenta = codigoVestimenta; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }
}
