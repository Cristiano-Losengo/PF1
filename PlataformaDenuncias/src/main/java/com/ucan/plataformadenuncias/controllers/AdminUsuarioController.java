package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.UtilizadorDTO;
import com.ucan.plataformadenuncias.entities.Pessoa;
import com.ucan.plataformadenuncias.entities.Telefone;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.PessoaRepository;
import com.ucan.plataformadenuncias.repositories.TelefoneRepository;
import com.ucan.plataformadenuncias.repositories.UtilizadorRepository;
import com.ucan.plataformadenuncias.services.UtilizadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/utilizadores")
@CrossOrigin(origins = "*")
public class AdminUsuarioController {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private UtilizadorService utilizadorService;

    @Autowired
    private TelefoneRepository telefoneRepository;

    @Autowired
   // private EmailRepository emailRepository;

    @GetMapping("/listar_utilizadores")
    public List<UtilizadorDTO> listarTodos() {
       // return pessoaRepository.findAll();
        return utilizadorService.findAll();
    }

    @PostMapping
    public Utilizador adicionar(@RequestBody UtilizadorDTO usuarioDTO) {

        System.out.println(usuarioDTO);

        Utilizador utilizadorModel = new Utilizador();
        Pessoa pessoaModel = new Pessoa();
        Telefone telefoneModel =  new Telefone();
        LocalDateTime localDate = LocalDateTime.now();

       // emailModel.setMail(usuarioDTO.getEmail());

      //  telefoneModel.setNumero(usuarioDTO.getTelefone());
        telefoneModel.setCreatedAt(localDate);

        pessoaModel.setNome(usuarioDTO.getNome());
        pessoaModel.setIdentificacao(usuarioDTO.getIdentificacao());
        pessoaModel.setDataNascimento(usuarioDTO.getDataNascimento());
        pessoaModel.setCreatedAt(localDate);

        pessoaModel = pessoaRepository.save(pessoaModel); // salva pessoa e retorna

       // emailModel.setFkPessoa(pessoaModel);
        telefoneModel.setFkPessoa(pessoaModel);

//        utilizadorModel.setEmail(usuarioDTO.getEmail());
       // utilizadorModel.setUsername(usuarioDTO.getEmail());
       // utilizadorModel.setPasswordHash("123");
        utilizadorModel.setAtivo(true);

        utilizadorModel.setFkPessoa(pessoaModel); //salva usuario e retorna

        return utilizadorRepository.save(utilizadorModel);
    }

    @GetMapping("/{id}")
    public Utilizador buscarPorId(@PathVariable int id) {
        return utilizadorRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Utilizador atualizar(@PathVariable int id, @RequestBody Pessoa motorista) {

        Pessoa pessoaModel = pessoaRepository.save(motorista);
        Utilizador utilizadorModel = new Utilizador();

        return utilizadorRepository.save(utilizadorModel);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable int id) {
        utilizadorRepository.deleteById(id);
    }

}
