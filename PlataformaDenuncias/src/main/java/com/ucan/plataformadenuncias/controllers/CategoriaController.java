package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Categoria;
import com.ucan.plataformadenuncias.repositories.CategoriaRepository;
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
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;


    @PostMapping
    public ResponseEntity<Categoria> criar(@Valid @RequestBody Categoria categoria) {

        // Garante que não vem PK no POST
        categoria.setPkCategoria(null);

        Categoria salva = categoriaRepository.save(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }


    @GetMapping
    public ResponseEntity<List<Categoria>> listarTodas() {
        List<Categoria> categorias = categoriaRepository.findAll();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Integer id) {

        Optional<Categoria> categoria = categoriaRepository.findById(id);

        return categoria
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody Categoria categoriaAtualizada) {

        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);

        if (categoriaExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Categoria categoria = categoriaExistente.get();
        categoria.setNome(categoriaAtualizada.getNome());
        categoria.setLocalidade(categoriaAtualizada.getLocalidade());

        Categoria salva = categoriaRepository.save(categoria);
        return ResponseEntity.ok(salva);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {

        if (!categoriaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        categoriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
