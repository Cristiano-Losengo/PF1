package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.services.PerfilService;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/perfis")
public class PerfilController {
    
    @Autowired
    private PerfilService service;
    
    // Expressões regulares para validação
    private static final Pattern DESIGNACAO_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s\\-']+$");
    private static final Pattern DESCRICAO_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ0-9\\s\\-',.!?]*$");

    @GetMapping
    public List<Perfil> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Perfil> getById(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Perfil perfil) {
        Map<String, String> erros = validarPerfil(perfil);
        
        if (!erros.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro de validação");
            response.put("erros", erros);
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            Perfil perfilSalvo = service.salvar(perfil);
            return ResponseEntity.ok(perfilSalvo);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao salvar perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Perfil perfil) {
        perfil.setPkPerfil(id);
        Map<String, String> erros = validarPerfil(perfil);
        
        if (!erros.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro de validação");
            response.put("erros", erros);
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            Perfil perfilAtualizado = service.salvar(perfil);
            return ResponseEntity.ok(perfilAtualizado);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao atualizar perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.remover(id);
    }
    
    private Map<String, String> validarPerfil(Perfil perfil) {
        Map<String, String> erros = new HashMap<>();
        
        // Validação da designação
        if (perfil.getDesignacao() == null || perfil.getDesignacao().trim().isEmpty()) {
            erros.put("designacao", "A designação é obrigatória");
        } else {
            String designacao = perfil.getDesignacao().trim();
            
            if (designacao.length() < 3) {
                erros.put("designacao", "A designação deve ter no mínimo 3 caracteres");
            } else if (designacao.length() > 50) {
                erros.put("designacao", "A designação não pode exceder 50 caracteres");
            } else if (!DESIGNACAO_PATTERN.matcher(designacao).matches()) {
                erros.put("designacao", "A designação não pode conter números ou caracteres especiais");
            }
        }
        
        // Validação da descrição
        if (perfil.getDescricao() != null && !perfil.getDescricao().trim().isEmpty()) {
            String descricao = perfil.getDescricao().trim();
            
            if (descricao.length() > 200) {
                erros.put("descricao", "A descrição não pode exceder 200 caracteres");
            } else if (!DESCRICAO_PATTERN.matcher(descricao).matches()) {
                erros.put("descricao", "A descrição contém caracteres inválidos");
            }
        }
                
        return erros;
    }
    
    
  
    
    
}
