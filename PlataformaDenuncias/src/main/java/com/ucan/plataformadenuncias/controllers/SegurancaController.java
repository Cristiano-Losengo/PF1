package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadePerfilDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/seguranca")  // Padronização comum para endpoints de autenticação
@CrossOrigin(origins = "*")    // Permite acesso de qualquer origem (ajuste conforme necessidade)
public class SegurancaController {

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private ContaPerfilRepository contaPerfilRepository;

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    @Autowired
    private FuncionalidadePerfilRepository funcionalidadePerfilRepository;

    @GetMapping("/")
    public String index() {
        return "Segurança ON";
    }

    @GetMapping("funcionalidade_listar")
    public List<Funcionalidade> listarFuncionalidade() {
        return funcionalidadeRepository.findAll();
    }

    @GetMapping("conta_listar")
    public List<Conta> listarConta() {
        return contaRepository.findAll();
    }

    @GetMapping("perfil_listar")
    public List<Perfil> listarPerfil() {
        return perfilRepository.findAll();
    }

    @GetMapping("conta_perfil_listar")
    public List<ContaPerfil> listarContaPerfil() {
        return contaPerfilRepository.findAll();
    }

    @GetMapping("funcionalidade_perfil_listar")
    public List<FuncionalidadePerfilDTO> listarFuncionalidadePerfil() {

        List<FuncionalidadePerfilDTO> listFuncionalidadePerfil = new ArrayList<>();

        for (FuncionalidadePerfil funcionalidadePerfilModel : funcionalidadePerfilRepository.findAll()) {

            FuncionalidadePerfilDTO funcionalidadePerfilDTO = new FuncionalidadePerfilDTO();
            funcionalidadePerfilDTO.setNomePerfil(funcionalidadePerfilModel.getFkPerfil().getNome());
            funcionalidadePerfilDTO.setNomeFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getDescricao());

            funcionalidadePerfilDTO.setFkPerfil(funcionalidadePerfilModel.getFkPerfil().getPkPerfil());
            funcionalidadePerfilDTO.setFkFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getPkFuncionalidade());

            System.out.println("HOJE");
            System.out.println(funcionalidadePerfilModel.getFkPerfil().getFkPerfil());
            funcionalidadePerfilDTO.setPaiFuncionalidade(funcionalidadePerfilModel.getFkPerfil().getFkPerfil().getNome());
            funcionalidadePerfilDTO.setTipoFuncionalidade(String.valueOf(funcionalidadePerfilModel.getFkFuncionalidade().getTipoFuncionalidade()));

            listFuncionalidadePerfil.add(funcionalidadePerfilDTO);

        }

        return listFuncionalidadePerfil;

    }

    @PostMapping("/conta_cadastrar")
    public Conta cadastrarConta(@RequestBody Conta conta) {

        Conta contaModel = contaRepository.save(conta);
        return contaModel;
    }

    @PostMapping("/perfil_cadastrar")
    public Perfil cadastrarPerfil(@RequestBody Perfil perfil) {

        Perfil perfilModel = perfilRepository.save(perfil);
        return perfilModel;
    }

    @PostMapping("/conta_perfil_cadastrar")
    public ContaPerfil cadastrarContaPerfil(@RequestBody ContaPerfilDTO contaPerfilDTO) {

        Perfil perfilModel = new Perfil();
        Conta contaModel = new Conta();
        ContaPerfil contaPerfilModel = new ContaPerfil();

        perfilModel.setPkPerfil(contaPerfilDTO.getFkPerfil());
        contaModel.setPkConta(contaPerfilDTO.getFkConta());

        contaPerfilModel.setFkPerfil(perfilModel);
        contaPerfilModel.setFkConta(contaModel);

        ContaPerfil contaPerfilModelAux = contaPerfilRepository.save(contaPerfilModel);

        return contaPerfilModelAux;

    }

    @PostMapping("/funcionalidade_cadastrar")
    public Funcionalidade cadastrarFuncionalidade(@RequestBody Funcionalidade funcionalidade) {

        Funcionalidade funcionalidadeModel = funcionalidadeRepository.save(funcionalidade);

        return funcionalidadeModel;
    }

    @PostMapping("/funcionalidade_perfil_cadastrar")
    public FuncionalidadePerfil cadastrarFuncionalidadePerfil(@RequestBody FuncionalidadePerfilDTO funcionalidadePerfilDTO) {

        Funcionalidade funcionalidadeModel = new Funcionalidade();
        Perfil perfilModel = new Perfil();
        FuncionalidadePerfil funcionalidadePerfilModel = new FuncionalidadePerfil();

        funcionalidadeModel.setPkFuncionalidade(funcionalidadePerfilDTO.getFkFuncionalidade());
        perfilModel.setPkPerfil(funcionalidadePerfilDTO.getFkPerfil());

        funcionalidadePerfilModel.setFkFuncionalidade(funcionalidadeModel);
        funcionalidadePerfilModel.setFkPerfil(perfilModel);

        return funcionalidadePerfilModel;
    }

    @PutMapping("/funcionalidade_editar/{id}")
    public Funcionalidade editarFuncionalidade(@PathVariable int id, @RequestBody Funcionalidade funcionalidade) {

        funcionalidade.setPkFuncionalidade(id);

        return funcionalidadeRepository.save(funcionalidade);
    }

}