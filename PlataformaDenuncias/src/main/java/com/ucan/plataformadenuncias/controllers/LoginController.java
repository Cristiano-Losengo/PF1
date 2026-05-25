package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.LoginDTO;
import com.ucan.plataformadenuncias.dto.MenuDTO;
import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.repositories.ContaPerfilRepository;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import com.ucan.plataformadenuncias.services.MenuDTOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class LoginController {

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private ContaPerfilRepository contaPerfilRepository;

    @Autowired
    private MenuDTOService menuDTOService;
    
@PostMapping("/login")
@Transactional
public ResponseEntity<?> login(@RequestBody LoginDTO login) {

    try {
        // 1. Verificar usuário
        Optional<Conta> contaOpt = contaRepository.findByEmail(login.getUsername());
        
        if (contaOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "sucesso", false,
                "mensagem", "Usuário ou senha inválidos"
            ));
        }
        
        Conta conta = contaOpt.get();
        
        // 2. Verificar senha
        if (!login.getPassword().equals(conta.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of(
                "sucesso", false,
                "mensagem", "Usuário ou senha inválidos"
            ));
        }
        
        // 3. Buscar perfil
        Optional<ContaPerfil> contaPerfilOpt = contaPerfilRepository.findByFkConta(conta);
        
        if (contaPerfilOpt.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of(
                "sucesso", false,
                "mensagem", "Perfil não associado à conta"
            ));
        }
        
        ContaPerfil contaPerfil = contaPerfilOpt.get();
        Perfil perfil = contaPerfil.getFkPerfil();
        
        // 4. 🔥 CORREÇÃO: Verificar se é ROOT pelo nome do perfil
        boolean isRoot = perfil.getDesignacao() != null && 
                         "ROOT".equalsIgnoreCase(perfil.getDesignacao());
        
        // 5. Buscar menus
        List<MenuDTO> menus = menuDTOService.getMenu(perfil.getPkPerfil());
        
        // 6. 🔥 CORREÇÃO: ROOT sempre tem acessoTotal = true
        boolean acessoTotal = isRoot || menus.stream()
            .anyMatch(m -> m.getPkFuncionalidade() != null && m.getPkFuncionalidade() == 1);
        
        // 7. 🔥 CORREÇÃO: Se for ROOT, garantir que os menus contenham TUDO
        if (isRoot && (menus == null || menus.isEmpty())) {
            // Buscar TODAS as funcionalidades para o ROOT
            menus = menuDTOService.getAllFuncionalidades();
            acessoTotal = true;
        }
        
        // Buscar nome da pessoa
        String nome = "";
        if (conta.getFkPessoa() != null) {
            nome = conta.getFkPessoa().getNome() != null ? 
                conta.getFkPessoa().getNome() : login.getUsername();
        } else {
            nome = login.getUsername();
        }
        
        System.out.println("=== LOGIN REALIZADO ===");
        System.out.println("Email: " + conta.getEmail());
        System.out.println("Perfil: " + perfil.getDesignacao());
        System.out.println("É ROOT? " + isRoot);
        System.out.println("Acesso Total: " + acessoTotal);
        System.out.println("Quantidade de Menus: " + (menus != null ? menus.size() : 0));
        
        // 8. Retornar resposta
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", true);
        response.put("email", conta.getEmail());
        response.put("perfil", perfil.getDesignacao());
        response.put("nome", nome);
        response.put("menus", menus != null ? menus : List.of());
        response.put("acessoTotal", acessoTotal);
        response.put("isRoot", isRoot);
        response.put("pkPerfil", perfil.getPkPerfil());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        System.err.println("❌ Erro no login: " + e.getMessage());
        e.printStackTrace();
        
        return ResponseEntity.status(500).body(Map.of(
            "sucesso", false,
            "mensagem", "Erro interno no servidor: " + e.getMessage()
        ));
    }
}

    // 🔍 Endpoint de status do servidor
    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of(
            "status", "Servidor de autenticação operacional"
        ));
    }
}
