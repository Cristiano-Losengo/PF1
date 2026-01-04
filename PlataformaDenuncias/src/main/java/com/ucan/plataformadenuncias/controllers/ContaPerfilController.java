package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.services.ContaPerfilService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conta_perfis")
public class ContaPerfilController {

    private final ContaPerfilService contaPerfilService;

    public ContaPerfilController(ContaPerfilService contaPerfilService) {
        this.contaPerfilService = contaPerfilService;
    }

    @GetMapping("/listar_conta_perfil")
    public List<ContaPerfilDTO> getAll() {
        return contaPerfilService.listarContaPerfis();
    }

    @GetMapping("/{id}")
    public Optional<ContaPerfil> getById(@PathVariable Integer id) {
        return contaPerfilService.buscarPorId(id);
    }

    @PostMapping
    public ContaPerfil create(@RequestBody ContaPerfil entity) {
        return contaPerfilService.salvar(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        contaPerfilService.remover(id);
    }
}
