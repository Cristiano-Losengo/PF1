package com.ucan.plataformadenuncias.controllers;


import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.services.ContaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
/**
 *
 * @author cristiano
 */


@RestController
@RequestMapping("/api/contas")
public class ContaController {

    @Autowired
    private ContaService contaService;

    @GetMapping
    public List<Conta> getAll() {
        return contaService.listarTodos();
    }

  /*  @GetMapping("/{id}")
    public Conta getById(@PathVariable Long id) {
        return contaService.buscarPorId(id);
    }*/

    @PostMapping
    public Conta create(@RequestBody Conta conta) {
        return contaService.salvar(conta);
    }

    /*@PutMapping("/{id}")
    public Conta update(@PathVariable Long id, @RequestBody Conta conta) {
        return contaService.update(id, conta);
    }*/

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        contaService.remover(id);
    }
}
