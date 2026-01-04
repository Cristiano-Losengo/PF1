package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Genero;
import com.ucan.plataformadenuncias.repositories.GeneroRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author cristiano
 */
@RestController
@RequestMapping("/api/genero")
@CrossOrigin(origins = "*")
public class GeneroController {

    @Autowired
    private GeneroRepository generoRepository;

    @GetMapping("genero_listar")
    public ResponseEntity<List<Genero>> genero_listar() {
        List<Genero> generos = generoRepository.findAll();
        return ResponseEntity.ok(generos);
    }

   
}
