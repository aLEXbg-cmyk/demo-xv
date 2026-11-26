package com.quinceanera.controller;

import com.quinceanera.model.ConfirmacionDAO;
import com.quinceanera.model.Invitado;

import java.io.IOException;
import java.util.UUID;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * ========================================================
 * CONTROLADOR: ConfirmacionServlet.java
 * Servlet HTTP que gestiona peticiones en un servidor Java EE / Tomcat en NetBeans.
 * ========================================================
 */
@WebServlet(name = "ConfirmacionServlet", urlPatterns = {"/api/confirmar", "/api/confirmados"})
public class ConfirmacionServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ConfirmacionDAO dao = new ConfirmacionDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        // Devuelve listado de confirmados en formato JSON
        response.getWriter().write("{\"total\": " + dao.obtenerTodos().size() + ", \"pases\": " + dao.obtenerTotalPases() + "}");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String nombre = request.getParameter("nombre");
        String pasesStr = request.getParameter("pases");
        String asistenciaStr = request.getParameter("asistencia");
        String telefono = request.getParameter("telefono");
        String mensaje = request.getParameter("mensaje");
        String menu = request.getParameter("menu");

        int pases = 1;
        try {
            if (pasesStr != null) pases = Integer.parseInt(pasesStr);
        } catch (NumberFormatException ignored) {}

        boolean asistencia = "true".equalsIgnoreCase(asistenciaStr) || "1".equals(asistenciaStr);
        String id = "XV-VAL-" + (1000 + (int)(Math.random() * 9000));

        Invitado nuevo = new Invitado(id, nombre, pases, asistencia, telefono, mensaje, menu, "Hoy");
        if (nuevo.esValido()) {
            dao.guardar(nuevo);
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"status\":\"ok\", \"id\":\"" + id + "\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"Datos inválidos\"}");
        }
    }
}
