package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.services.ContaPerfilService;
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
@RequestMapping("/api/conta-perfis")
public class ContaPerfilController {
    @Autowired
    private ContaPerfilService service;

    @GetMapping("/listarPerfil")
    public Optional<ContaPerfil> getAll() {
        return service.buscarPorId(Integer.MIN_VALUE);
    }

    @GetMapping("/{id}")
    public Optional<ContaPerfil> getById(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ContaPerfil create(@RequestBody ContaPerfil entity) {
        return service.salvar(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.remover(id);
    }
}
