package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.LoginDTO;
import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.repositories.ContaPerfilRepository;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO login) {

        // 1️⃣ Verifica usuário
        Conta conta = contaRepository.findByEmail(login.getUsername()).get();

        System.out.println(conta.getPasswordHash());
        System.out.println(conta.getEmail());

        if (conta == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "sucesso", false,
                    "mensagem", "Usuário ou senha inválidos"
            ));
        }

        // 2️⃣ Verifica senha
        if ( !login.getPassword().equals(conta.getPasswordHash()) ) {
            return ResponseEntity.status(401).body(Map.of(
                    "sucesso", false,
                    "mensagem", "Usuário ou senha inválidos"
            ));
        }

        // 3️⃣ Busca perfil
        Optional<ContaPerfil> contaPerfilOpt =
                contaPerfilRepository.findByFkConta(conta);

        if (contaPerfilOpt.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of(
                    "sucesso", false,
                    "mensagem", "Perfil não associado à conta"
            ));
        }

        ContaPerfil contaPerfil = contaPerfilOpt.get();
        String perfil = contaPerfil.getFkPerfil().getDesignacao();

        // 4️⃣ Retorno simples sem JWT
        return ResponseEntity.ok(Map.of(
                "sucesso", true,
                "email", conta.getEmail(),
                "perfil", perfil
        ));
    }

    // 🔍 Endpoint de status do servidor
    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of(
                "status", "Servidor de autenticação operacional"
        ));
    }
}
