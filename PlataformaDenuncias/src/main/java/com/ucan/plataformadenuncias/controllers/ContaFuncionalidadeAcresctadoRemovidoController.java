package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.ContaFuncionalidadeAcrestadoRemovido;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.data.jpa.domain.AbstractPersistable_.id;
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
@RequestMapping("/api/conta-funcionalidade")
public class ContaFuncionalidadeAcresctadoRemovidoController {
    
    //@Autowired
   // private ContaFuncionalidadeAcrestadoRemovido service;

     /*  @GetMapping
 public List<ContaFuncionalidadeAcrestadoRemovido> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ContaFuncionalidadeAcrestadoRemovido save(@PathVariable Long id) {
        return service.getPkContaFuncionalidadeAcrestadoRemovido();
    }

    @PostMapping
    public ContaFuncionalidadeAcresctadoRemovido create(@RequestBody ContaFuncionalidadeAcresctadoRemovido entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public ContaFuncionalidadeAcresctadoRemovido update(@PathVariable Long id, @RequestBody ContaFuncionalidadeAcresctadoRemovido entity) {
        return service.update(id, entity);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        service.deleteById(id);
        deleteById
    }*/
}
