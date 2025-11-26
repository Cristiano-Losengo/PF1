package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.LoginDTO;
import com.ucan.plataformadenuncias.dto.UtilizadorDTO;
import com.ucan.plataformadenuncias.entities.Telefone;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import com.ucan.plataformadenuncias.repositories.TelefoneRepository;
import com.ucan.plataformadenuncias.repositories.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class LoginController {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private ContaRepository contaPerfilRepository;

    @Autowired
    private TelefoneRepository telefoneRepository;

    @GetMapping("/status")
    public String verificarStatusServidor(@RequestParam String loginRequest) {
        return "Servidor autenticação está operacional - " + java.time.LocalDateTime.now();
    }

    @PostMapping("/login")
    public UtilizadorDTO login(@RequestBody LoginDTO login) {

        Utilizador utilizadorModel = utilizadorRepository.findByUsernameAndPasswordHash(login.getUsername(), login.getPassword());
        UtilizadorDTO utilizadorDTO =  new UtilizadorDTO();

        utilizadorDTO.setEmail(utilizadorModel.getEmail());
        utilizadorDTO.setUsername(utilizadorModel.getUsername());
        utilizadorDTO.setNome(utilizadorModel.getFkPessoa().getNome());
        utilizadorDTO.setNivelAcesso(utilizadorModel.getFkConta().getNomeCompleto());
        utilizadorDTO.setDataNascimento(utilizadorModel.getFkPessoa().getDataNascimento());
        utilizadorDTO.setIdentificacao(utilizadorModel.getFkPessoa().getIdentificacao());

        Telefone telefoneModel = telefoneRepository.findByFkPessoa(utilizadorModel.getFkPessoa().getPkPessoa());

        System.out.println(telefoneModel);
        System.out.println(login);

        if (utilizadorModel != null) {
            return utilizadorDTO;
        }

        return null;

    }

    // Classe interna para representar o request de login
    private static class LoginRequest {

        private String username;
        private String password;

        // Getters e Setters (necessários para o Spring)
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

}