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
@CrossOrigin(origins = "*")
public class ContaController {

    @Autowired
    private ContaService contaService;

    @GetMapping("/listarContas")
    public List<Conta> getAll() {
        return contaService.listarTodos();
    }

    @PostMapping
    public Conta create(@RequestBody Conta conta) {
        return contaService.salvar(conta);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        contaService.remover(id);
    }
}
