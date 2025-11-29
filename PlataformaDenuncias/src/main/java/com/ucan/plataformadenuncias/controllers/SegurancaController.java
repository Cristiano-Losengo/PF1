package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadeDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadePerfilDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.initializer.TipoFuncionalidadeLoader;
import com.ucan.plataformadenuncias.repositories.*;
import com.ucan.plataformadenuncias.services.VersaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seguranca")  
@CrossOrigin(origins = "*")    
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

    @Autowired
    private TipoFuncionalidadeRepository tipoFuncionalidadeRepository;

    @Autowired
    private VersaoService versaoService;

    @GetMapping("/")
    public String index() {
        return "Segurança ON";
    }

    @GetMapping("/funcionalidade_listar")
    public List<FuncionalidadeDTO> listarFuncionalidade() {

        System.out.println(funcionalidadeRepository.findAll());

        List<FuncionalidadeDTO> listaFuncionalidade = new ArrayList<>();

        for (Funcionalidade funcionalidade : funcionalidadeRepository.findAll() )
        {
            FuncionalidadeDTO funcionalidadeDTO = new FuncionalidadeDTO();
            funcionalidadeDTO.setPkFuncionalidade(funcionalidade.getPkFuncionalidade());
            funcionalidadeDTO.setDesignacao(funcionalidade.getDesignacao());
            funcionalidadeDTO.setDescricao(funcionalidade.getDescricao());
            funcionalidadeDTO.setCreatedAt(funcionalidade.getCreatedAt());
            funcionalidadeDTO.setUpdatedAt(funcionalidade.getUpdatedAt());
            funcionalidadeDTO.setUrl(funcionalidade.getUrl());
            funcionalidadeDTO.setFkTipoFuncionalidade(funcionalidade.getFkTipoFuncionalidade().getPkTipoFuncionalidade());
            funcionalidadeDTO.setDesignacaoTipoFuncionalidade(funcionalidade.getFkTipoFuncionalidade().getDesignacao());

            if(funcionalidade.getFkFuncionalidade() != null)
            {
                funcionalidadeDTO.setFkFuncionalidade(funcionalidade.getFkFuncionalidade().getPkFuncionalidade());
            }

            listaFuncionalidade.add(funcionalidadeDTO);
        }

        return listaFuncionalidade;

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
            funcionalidadePerfilDTO.setNomePerfil(funcionalidadePerfilModel.getFkPerfil().getDesignacao());
            funcionalidadePerfilDTO.setNomeFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getDescricao());

            funcionalidadePerfilDTO.setFkPerfil(funcionalidadePerfilModel.getFkPerfil().getPkPerfil());
            funcionalidadePerfilDTO.setFkFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getPkFuncionalidade());

            System.out.println("HOJE");
            System.out.println(funcionalidadePerfilModel.getFkPerfil().getFkPerfil());
            funcionalidadePerfilDTO.setPaiFuncionalidade(funcionalidadePerfilModel.getFkPerfil().getFkPerfil().getDesignacao());
         //   funcionalidadePerfilDTO.setTipoFuncionalidade(String.valueOf(funcionalidadePerfilModel.getFkFuncionalidade()));

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
        contaModel.setNomeCompleto(contaPerfilDTO.getNomeCompleto());
        contaModel.setEmail(contaPerfilDTO.getEmail());
        contaModel.setSenha(contaModel.getSenha());
        contaModel.setTipoConta(contaPerfilDTO.getTipoConta());

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

    @PostMapping("/funcionalidade_importar")
public ResponseEntity<?> importar(@RequestParam("file") MultipartFile file) {
    try {
        Map<String, Object> resultado = new HashMap<>();
        
        // Validação do tipo de funcionalidade primeiro
        List<String> errosTipo = TipoFuncionalidadeLoader.insertTipoFuncionalidadeIntoTable(
            file, tipoFuncionalidadeRepository);
        
        if (!errosTipo.isEmpty()) {
            resultado.put("erros", errosTipo);
            resultado.put("sucesso", false);
            return ResponseEntity.badRequest().body(resultado);
        }

        Thread.sleep(2000);

        // Validação das funcionalidades
        List<String> errosFunc = TipoFuncionalidadeLoader.insertFuncionalidadeIntoTable(
            file, funcionalidadeRepository, versaoService);
        
        if (!errosFunc.isEmpty()) {
            resultado.put("erros", errosFunc);
            resultado.put("sucesso", false);
            return ResponseEntity.badRequest().body(resultado);
        }

        resultado.put("mensagem", "Ficheiro importado com sucesso!");
        resultado.put("sucesso", true);
        return ResponseEntity.ok(resultado);

    } catch (Exception e) {
        Map<String, Object> erro = new HashMap<>();
        erro.put("erro", "Erro durante a importação: " + e.getMessage());
        erro.put("sucesso", false);
        return ResponseEntity.badRequest().body(erro);
    }
}

}
