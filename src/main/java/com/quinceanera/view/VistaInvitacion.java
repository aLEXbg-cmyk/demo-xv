package com.quinceanera.view;

import com.quinceanera.model.Evento;
import com.quinceanera.model.Invitado;

/**
 * ========================================================
 * VISTA: VistaInvitacion.java
 * Clase auxiliar de renderizado de vistas en Java para Apache NetBeans.
 * ========================================================
 */
public class VistaInvitacion {

    public String renderizarMensajeConfirmacion(Invitado invitado, Evento evento) {
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("✨ CONFIRMACIÓN DE ASISTENCIA ✨\n");
        sb.append("XV Años: ").append(evento.getNombreQuinceanera()).append("\n");
        sb.append("Invitado: ").append(invitado.getNombre()).append("\n");
        sb.append("Pases: ").append(invitado.getPases()).append("\n");
        sb.append("Menú: ").append(invitado.getMenu()).append("\n");
        sb.append("Lugar: ").append(evento.getLugarRecepcion()).append("\n");
        sb.append("=========================================\n");
        return sb.toString();
    }
}
