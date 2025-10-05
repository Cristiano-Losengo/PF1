/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Denuncia;
import com.ucan.plataformadenuncias.repositories.DenunciaRepository;
import com.ucan.plataformadenuncias.services.DenunciaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author cristiano
 */
// ============== CONTROLLERS ===============

/*@RestController
@RequestMapping("/api/denuncias")
@CrossOrigin(origins = "http://localhost:4200")
public class DenunciaController {
    @Autowired
    private DenunciaService service;

    @GetMapping
    public List<Denuncia> listar() {
        return service.listarTodas();
    }

    @PostMapping
    public Denuncia criar(@RequestBody Denuncia denuncia) {
        return service.salvar(denuncia);
    }
}
*/
