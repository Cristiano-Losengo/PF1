package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import com.ucan.plataformadenuncias.services.FuncionalidadePerfilService;
import java.util.List;
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
@RequestMapping("/api/funcionalidade-perfis")
public class FuncionalidadePerfilController {
    @Autowired
    private FuncionalidadePerfilService service;

    @GetMapping
    public List<FuncionalidadePerfil> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<FuncionalidadePerfil> getById(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public FuncionalidadePerfil create(@RequestBody FuncionalidadePerfil entity) {
        return service.salvar(entity);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.remover(id);
    }
}
