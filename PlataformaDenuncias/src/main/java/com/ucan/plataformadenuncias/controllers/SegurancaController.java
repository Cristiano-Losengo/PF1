package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadeDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadePerfilDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.initializer.TipoFuncionalidadeLoader;
import com.ucan.plataformadenuncias.repositories.*;
import com.ucan.plataformadenuncias.services.VersaoService;
import java.text.SimpleDateFormat;
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
    public List<ContaPerfilDTO> listarContaPerfil() {

        List<ContaPerfilDTO> listContaPerfil = new ArrayList<>();

        for(ContaPerfil contaPerfil : contaPerfilRepository.findAll())
        {
            ContaPerfilDTO contaPerfilDTO = new ContaPerfilDTO();

            contaPerfilDTO.setFkPerfil(contaPerfil.getFkPerfil().getPkPerfil());
            contaPerfilDTO.setFkConta(contaPerfil.getFkConta().getPkConta());

            contaPerfilDTO.setEmail(contaPerfil.getFkConta().getEmail());
            contaPerfilDTO.setTipoConta(contaPerfil.getFkConta().getTipoConta().name());
            contaPerfilDTO.setNomeCompleto(contaPerfil.getFkConta().getNomeCompleto());
            contaPerfilDTO.setEstado(contaPerfil.getStatus());
            contaPerfilDTO.setDesignacaoPerfil(contaPerfil.getFkPerfil().getDesignacao());

        }

        return listContaPerfil;
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

            funcionalidadePerfilDTO.setTipoFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getFkTipoFuncionalidade().getDesignacao());

            funcionalidadePerfilDTO.setDetalhePerfil(funcionalidadePerfilModel.getFkPerfil().getDescricao());
            funcionalidadePerfilDTO.setDetalheFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getDescricao());

            System.out.println("HOJE");
            System.out.println(funcionalidadePerfilModel.getFkPerfil());
            funcionalidadePerfilDTO.setPaiFuncionalidade(funcionalidadePerfilModel.getFkPerfil().getDesignacao());
         //   funcionalidadePerfilDTO.setTipoFuncionalidade(String.valueOf(funcionalidadePerfilModel.getFkFuncionalidade()));

            listFuncionalidadePerfil.add(funcionalidadePerfilDTO);

        }

        return listFuncionalidadePerfil;

    }

    @PostMapping("/conta_cadastrar")
    public Conta cadastrarConta(@RequestBody Conta conta) {

        Conta contaModel = contaRepository.save(conta);

        System.out.println(conta);
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
        contaModel.setTipoConta(null);

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

        System.out.println(funcionalidadePerfilDTO);
        Funcionalidade funcionalidadeModel = new Funcionalidade();
        Perfil perfilModel = new Perfil();
        FuncionalidadePerfil funcionalidadePerfilModel = new FuncionalidadePerfil();

        funcionalidadeModel.setPkFuncionalidade(funcionalidadePerfilDTO.getFkFuncionalidade());
        perfilModel.setPkPerfil(funcionalidadePerfilDTO.getFkPerfil());

        funcionalidadePerfilModel.setFkFuncionalidade(funcionalidadeModel);
        funcionalidadePerfilModel.setFkPerfil(perfilModel);

        funcionalidadePerfilRepository.save(funcionalidadePerfilModel);

        return funcionalidadePerfilModel;
    }

    @PutMapping("/funcionalidade_editar/{id}")
    public Funcionalidade editarFuncionalidade(@PathVariable int id, @RequestBody Funcionalidade funcionalidade) {
        funcionalidade.setPkFuncionalidade(id);
        return funcionalidadeRepository.save(funcionalidade);
    }

   @PostMapping("/funcionalidade_importar")
public ResponseEntity<?> importar(@RequestParam("file") MultipartFile file) {
    System.out.println("=== INICIANDO IMPORTAÇÃO ===");
    
    try {
        Map<String, Object> resultado = new HashMap<>();
        
        // PRIMEIRO: Processar tipos de funcionalidade com controle de versão
        List<String> errosTipo = TipoFuncionalidadeLoader.insertTipoFuncionalidadeIntoTable(
            file, tipoFuncionalidadeRepository, versaoService);
        
        System.out.println("Erros encontrados em tipos: " + errosTipo.size());
        
        if (!errosTipo.isEmpty()) {
            resultado.put("erros", errosTipo);
            resultado.put("sucesso", false);
            resultado.put("tipo", "validacao_tipos");
            
            // Adicionar informação de versão atual
            Versao versaoTipos = versaoService.obterVersao(Defs.TIPO_FUNCIONALIDADE);
            if (versaoTipos != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                resultado.put("versao_atual_tipos", sdf.format(versaoTipos.getData()));
            }
            
            return ResponseEntity.badRequest().body(resultado);
        }

        Thread.sleep(1000);

        // SEGUNDO: Processar funcionalidades com controle de versão
        List<String> errosFunc = TipoFuncionalidadeLoader.insertFuncionalidadeIntoTable(
            file, funcionalidadeRepository, versaoService);
        
        System.out.println("Erros encontrados em funcionalidades: " + errosFunc.size());
        
        if (!errosFunc.isEmpty()) {
            resultado.put("erros", errosFunc);
            resultado.put("sucesso", false);
            resultado.put("tipo", "validacao_funcionalidades");
            
            // Adicionar informação de versão atual
            Versao versaoFunc = versaoService.obterVersao(Defs.FUNCIONALIDADE);
            if (versaoFunc != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                resultado.put("versao_atual_funcionalidades", sdf.format(versaoFunc.getData()));
            }
            
            return ResponseEntity.badRequest().body(resultado);
        }

        // Obter informações das versões atualizadas
        Versao versaoTiposAtual = versaoService.obterVersao(Defs.TIPO_FUNCIONALIDADE);
        Versao versaoFuncAtual = versaoService.obterVersao(Defs.FUNCIONALIDADE);
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        String mensagem = "✅ Ficheiro importado com sucesso!";
        
        if (versaoTiposAtual != null) {
            mensagem += "\n📅 Versão tipos de funcionalidade: " + sdf.format(versaoTiposAtual.getData());
        }
        if (versaoFuncAtual != null) {
            mensagem += "\n📅 Versão funcionalidades: " + sdf.format(versaoFuncAtual.getData());
        }
        
        resultado.put("mensagem", mensagem);
        resultado.put("sucesso", true);
        
        return ResponseEntity.ok(resultado);

    } catch (Exception e) {
        Map<String, Object> erro = new HashMap<>();
        erro.put("erro", "❌ Erro durante a importação: " + e.getMessage());
        erro.put("sucesso", false);
        return ResponseEntity.badRequest().body(erro);
    }
}

@GetMapping("/versoes_atuais")
public ResponseEntity<?> obterVersoesAtuais() {
    Map<String, Object> resultado = new HashMap<>();
    
    Versao versaoTipos = versaoService.obterVersao(Defs.TIPO_FUNCIONALIDADE);
    Versao versaoFunc = versaoService.obterVersao(Defs.FUNCIONALIDADE);
    
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
    
    if (versaoTipos != null) {
        resultado.put("tipos_funcionalidade", sdf.format(versaoTipos.getData()));
    } else {
        resultado.put("tipos_funcionalidade", "Nunca importado");
    }
    
    if (versaoFunc != null) {
        resultado.put("funcionalidades", sdf.format(versaoFunc.getData()));
    } else {
        resultado.put("funcionalidades", "Nunca importado");
    }
    
    return ResponseEntity.ok(resultado);
}

}
