package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.services.PerfilService;
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
@RequestMapping("/api/perfis")
public class PerfilController {
    @Autowired
    private PerfilService service;

    @GetMapping
    public List<Perfil> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Perfil> getById(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Perfil create(@RequestBody Perfil entity) {
        return service.salvar(entity);
    }

    /*@PutMapping("/{id}")
    public Perfil update(@PathVariable Long id, @RequestBody Perfil entity) {
        return service.update(id, entity);
    }*/

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.remover(id);
    }
}
