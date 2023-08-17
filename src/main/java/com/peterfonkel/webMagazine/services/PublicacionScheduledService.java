package com.peterfonkel.webMagazine.services;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.peterfonkel.webMagazine.entities.Publicacion;

@Service
public class PublicacionScheduledService {

    @Autowired
    private PublicacionesService publicacionesService;

    @Scheduled(fixedRate = 120000) // 1 hora en milisegundos 3600000
    public void procesarPublicacionesPendientes() {
        try {
            List<Publicacion> listaPublicaciones = publicacionesService.findByIsPublicadoFalse();
            Instant ahora = Instant.now();
            
            for (Publicacion publicacion : listaPublicaciones) {
                if (!publicacion.isPublicado() && publicacion.getFechaPublicacionFutura().isBefore(ahora)) {
                    publicacion.setPublicado(true);
                    publicacionesService.save(publicacion);
                }
            }
        } catch (Exception e) {
            // Manejar la excepci�n adecuadamente
            e.printStackTrace(); // Opcional: registrar la excepci�n
        }
    }
}
