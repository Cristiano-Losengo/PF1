package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Genero;
import com.ucan.plataformadenuncias.entities.Pessoa;
import com.ucan.plataformadenuncias.repositories.PessoaRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author cristiano
 */
@RestController
@RequestMapping("/api/pessoas")
@CrossOrigin(origins = "*")
public class PessoaController {

    @Autowired
    private PessoaRepository pessoaRepository;

    /* =========================
       CREATE
       ========================= */
    @PostMapping
    public ResponseEntity<Pessoa> criar(@Valid @RequestBody Pessoa pessoa) {

        // Garantir que não vem PK no POST
        pessoa.setPkPessoa(null);

        Pessoa salva = pessoaRepository.save(pessoa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

  
    @GetMapping
    public ResponseEntity<List<Pessoa>> listarTodas() {
        List<Pessoa> pessoas = pessoaRepository.findAll();
        return ResponseEntity.ok(pessoas);
    }

   
    @GetMapping("/{id}")
    public ResponseEntity<Pessoa> buscarPorId(@PathVariable Integer id) {

        Optional<Pessoa> pessoa = pessoaRepository.findById(id);

        return pessoa
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

   
    @PutMapping("/{id}")
    public ResponseEntity<Pessoa> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody Pessoa pessoaAtualizada) {

        Optional<Pessoa> pessoaExistente = pessoaRepository.findById(id);

        if (pessoaExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pessoa pessoa = pessoaExistente.get();

        pessoa.setNome(pessoaAtualizada.getNome());
//        pessoa.setIdentificacao(pessoaAtualizada.getIdentificacao());
        pessoa.setDataNascimento(pessoaAtualizada.getDataNascimento());
        pessoa.setFkGenero(new Genero(pessoaAtualizada.getFkGenero().getPkGenero()) );
        pessoa.setLocalidade(pessoaAtualizada.getLocalidade());

        Pessoa salva = pessoaRepository.save(pessoa);
        return ResponseEntity.ok(salva);
    }

    /* =========================
       DELETE
       ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {

        if (!pessoaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        pessoaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

