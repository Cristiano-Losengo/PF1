package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.HistoricoActividade;
import com.ucan.plataformadenuncias.services.HistoricoActividadeService;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author cristiano
 */
@RestController
@RequestMapping("/api/historico-actividades")
public class HistoricoActividadeController {
    @Autowired
    private HistoricoActividadeService service;

    @GetMapping
    public Optional<HistoricoActividade> getAll() {
        return service.buscarPorId(Integer.MIN_VALUE);
    }

    @GetMapping("/{id}")
    public Optional<HistoricoActividade> getById(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public HistoricoActividade create(@RequestBody HistoricoActividade entity) {
        return service.salvar(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.remover(id);
    }
}

