package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.UtilizadorDTO;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import com.ucan.plataformadenuncias.repositories.PessoaRepository;
import com.ucan.plataformadenuncias.repositories.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilizador")
@CrossOrigin(origins = "*")
public class UtilizadorController {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @GetMapping("/status")
    public String verificarStatusServidor(@RequestParam String loginRequest) {
        return "Servidor autenticação está operacional - " + java.time.LocalDateTime.now();
    }

    @PostMapping("/atribuir_conta_utilizador")
    public Utilizador login(@RequestBody UtilizadorDTO utilizadorDTO) {

        Optional<Utilizador> utilizadorModel1 = utilizadorRepository.findById(utilizadorDTO.getPkUtilizador());

        System.out.println(utilizadorDTO);
/*
        PessoaModel pessoaModel = pessoaRepository.findByPkPessoa(utilizadorDTO.getFkPessoa());
        ContaModel contaModel = contaRepository.findByPkConta(utilizadorDTO.getFkConta());
        UtilizadorModel utilizadorModel = utilizadorRepository.findByFkPessoa(pessoaModel);

        utilizadorModel.setFkConta(contaModel);

        return utilizadorRepository.save(utilizadorModel);

 */

        return null;
    }

    @GetMapping("/listar_utilizadores")
    public List<UtilizadorDTO> listarUtilizadores() {

        List<UtilizadorDTO>  utilizadorDTOList = new ArrayList<>();

        for ( Utilizador utilizadorModel : utilizadorRepository.findAll())
        {
            UtilizadorDTO utilizadorDTO =  new UtilizadorDTO();

            utilizadorDTO.setPkUtilizador(utilizadorModel.getPkUtilizador());
            utilizadorDTO.setNome(utilizadorModel.getFkPessoa().getNome());
            utilizadorDTO.setNomeConta(utilizadorModel.getFkConta().getNome());

            utilizadorDTO.setFkPessoa(utilizadorModel.getFkPessoa().getPkPessoa());
            utilizadorDTO.setFkConta(utilizadorModel.getFkConta().getPkConta());

            utilizadorDTO.setUsername(utilizadorModel.getUsername());
            utilizadorDTO.setDetalhes(utilizadorModel.getDetalhe());

            utilizadorDTOList.add(utilizadorDTO);
        }

        return utilizadorDTOList;

    }

}