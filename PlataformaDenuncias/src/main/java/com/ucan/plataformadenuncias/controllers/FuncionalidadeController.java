package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import com.ucan.plataformadenuncias.entities.Pessoa;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/funcionalidades")  // Padronização comum para endpoints de autenticação
@CrossOrigin(origins = "*")    
public class FuncionalidadeController {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private FuncionalidadePerfilRepository funcionalidadePerfilRepository;

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @GetMapping("funcionalidade_listar")
    public List<FuncionalidadePerfil> listarTodos() {
        return funcionalidadePerfilRepository.findAll();
    }

    @PostMapping
    public Pessoa adicionar(@RequestBody Pessoa motorista) {

        Pessoa pessoaModel = pessoaRepository.save(motorista);
        Utilizador utilizadorModel = new Utilizador();

    /*
        usuario.setPessoaId(pessoaModel);
        usuario.setPasswordHash(dto.getPassword());
        usuario.setAtivo(true);
        usuario.setCreatedAt(LocalDateTime.now());
        usuario.setEmail(pessoaModel.getEmail());

        usuarioRepository.save();
    */
        return pessoaModel;
    }

    @GetMapping("/{id}")
    public Utilizador buscarPorId(@PathVariable int id) {
        return utilizadorRepository.findById(id).orElse(null);
    }

    @PostMapping("buscaPorIdentificacao")
    public Pessoa buscarPorIdentificacao(@RequestParam String identificacao) {
        return pessoaRepository.findByIdentificacao(identificacao);
    }

    @PutMapping("/{id}")
    public Utilizador atualizar(@PathVariable int id, @RequestBody Pessoa motorista) {

        motorista.setPkPessoa(id);
        Pessoa pessoaModel = pessoaRepository.save(motorista);
        Utilizador utilizadorModel = new Utilizador();

        return utilizadorRepository.save(utilizadorModel);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable int id) {
        utilizadorRepository.deleteById(id);
    }
}
