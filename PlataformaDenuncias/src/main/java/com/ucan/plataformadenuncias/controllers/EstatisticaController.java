package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Estatistica;
import com.ucan.plataformadenuncias.services.EstatisticaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
/*
    @GetMapping("/{id}")
    public Estatistica salvar(@PathVariable Long id) {
        return estatisticaService.listarTodos(id);
    }
*/
    
    /*@PostMapping
    public Estatistica create(@RequestBody Estatistica entity) {
        return estatisticaService.service(service);
 

    @PutMapping("/{id}")
    public Estatistica update(@PathVariable Long id, @RequestBody Estatistica entity) {
        return estatisticaService.update(id, entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        
    }

   }*/
}

