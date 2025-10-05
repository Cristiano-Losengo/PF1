package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.services.ContaPerfilService;
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
@RequestMapping("/api/conta-perfis")
public class ContaPerfilController {
    @Autowired
    private ContaPerfilService service;

    @GetMapping
    public Optional<ContaPerfil> getAll() {
        return service.buscarPorId(Long.MIN_VALUE);
    }

    @GetMapping("/{id}")
    public Optional<ContaPerfil> getById(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ContaPerfil create(@RequestBody ContaPerfil entity) {
        return service.salvar(entity);
    }

   /* @PutMapping("/{id}")
    public ContaPerfil update(@PathVariable Long id, @RequestBody ContaPerfil entity) {
        return service.update(id, entity);
    }*/

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.remover(id);
    }
}
