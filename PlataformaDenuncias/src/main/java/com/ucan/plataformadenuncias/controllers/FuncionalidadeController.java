package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.services.FuncionalidadeService;
import java.util.List;
import java.util.Optional;
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
@RequestMapping("/api/funcionalidades")
public class FuncionalidadeController {
    @Autowired
    private FuncionalidadeService service;

    @GetMapping
    public List<Funcionalidade> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Funcionalidade> buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Funcionalidade create(@RequestBody Funcionalidade entity) {
        return service.salvar(entity);
    }

   /* @PutMapping("/{id}")
    public Funcionalidade update(@PathVariable Long id, @RequestBody Funcionalidade entity) {
        return service.update(id, entity);
    }*/

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.remover(id);
    }
}

