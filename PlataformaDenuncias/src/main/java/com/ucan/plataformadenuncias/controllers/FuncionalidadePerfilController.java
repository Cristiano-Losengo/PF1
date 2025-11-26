package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import com.ucan.plataformadenuncias.entities.TipoFuncionalidade;
import com.ucan.plataformadenuncias.initializer.TipoFuncionalidadeLoader;
import com.ucan.plataformadenuncias.repositories.FuncionalidadeRepository;
import com.ucan.plataformadenuncias.repositories.TipoFuncionalidadeRepository;
import com.ucan.plataformadenuncias.services.FuncionalidadePerfilService;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author cristiano
 */
@RestController
@RequestMapping("/api/funcionalidade-perfis")
@CrossOrigin(origins = "*")
public class FuncionalidadePerfilController {

    @Autowired
    private FuncionalidadePerfilService service;

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    @Autowired
    private TipoFuncionalidadeRepository tipoFuncionalidadeRepository;

    @GetMapping
    public List<FuncionalidadePerfil> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<FuncionalidadePerfil> getById(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public FuncionalidadePerfil create(@RequestBody FuncionalidadePerfil entity) {
        return service.salvar(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.remover(id);
    }

    /*
    @PostMapping("/funcionalidade_importar")
    public ResponseEntity<?> importar(@RequestParam("file") MultipartFile file) {

        System.out.println(file);

        try {

            TipoFuncionalidadeLoader.insertTipoFuncionalidadeIntoTable(file, tipoFuncionalidadeRepository);
            Thread.sleep(5000);

            TipoFuncionalidadeLoader.insertFuncionalidadeIntoTable(file, funcionalidadeRepository);

        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok("Ficheiro recebido com sucesso!");

    }
    */

}
