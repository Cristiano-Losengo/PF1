
package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.services.UtilizadorService;
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
@RequestMapping("/api/utilizadores")
public class UtilizadorController {
    @Autowired
    private UtilizadorService service;

    @GetMapping
    public List<Utilizador> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Utilizador> getById(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Utilizador create(@RequestBody Utilizador entity) {
        return service.salvar(entity);
    }

   /* @PutMapping("/{id}")
    public Utilizador update(@PathVariable Long id, @RequestBody Utilizador entity) {
        return service.update(id, entity);
    }*/

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deletar(id);
    }
}
