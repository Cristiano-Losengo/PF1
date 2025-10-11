package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Estatistica;
import com.ucan.plataformadenuncias.services.EstatisticaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author cristiano
 */

@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticaController {
    
    @Autowired
    private EstatisticaService estatisticaService;

    @GetMapping
    public List<Estatistica> listarTodos() {
        return estatisticaService.listarTodos();
    }

}

