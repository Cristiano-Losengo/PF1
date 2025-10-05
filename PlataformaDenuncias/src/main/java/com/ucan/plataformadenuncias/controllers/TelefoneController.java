package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Telefone;
import com.ucan.plataformadenuncias.services.TelefoneService;
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
@RequestMapping("/api/telefones")
public class TelefoneController {
    
    //@Autowired
   // private TelefoneService service;

    /*@GetMapping
    public List<Telefone> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Telefone getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Telefone create(@RequestBody Telefone entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Telefone update(@PathVariable Long id, @RequestBody Telefone entity) {
        return service.update(id, entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }*/
}

