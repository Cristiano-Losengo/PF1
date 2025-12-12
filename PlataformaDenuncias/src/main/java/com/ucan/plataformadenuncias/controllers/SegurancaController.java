package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadeDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadePerfilDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.initializer.TipoFuncionalidadeLoader;
import com.ucan.plataformadenuncias.repositories.*;
import com.ucan.plataformadenuncias.services.VersaoService;
import jakarta.validation.Valid;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

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

    // Expressões regulares para validação
    private static final Pattern DESIGNACAO_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s\\-']+$");
    private static final Pattern DESCRICAO_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ0-9\\s\\-',.!?]*$");

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
public ResponseEntity<?> cadastrarPerfil(@RequestBody Perfil perfil) {
    
    Map<String, String> erros = new HashMap<>();
    
    // Validação da designação
    if (perfil.getDesignacao() == null || perfil.getDesignacao().trim().isEmpty()) {
      //  erros.put("designacao", "A designação é obrigatória");
    } else {
        String designacao = perfil.getDesignacao().trim();
        
        // Verificar tamanho
        if (designacao.length() < 3) {
            erros.put("designacao", "A designação deve ter no mínimo 3 caracteres");
        } else if (designacao.length() > 50) {
            erros.put("designacao", "A designação não pode exceder 50 caracteres");
        }
        
        // Verificar padrão de caracteres
        else if (!DESIGNACAO_PATTERN.matcher(designacao).matches()) {
            erros.put("designacao", "A designação não pode conter números ou caracteres especiais");
        }
        
        // Verificar se designação já existe
        else if (perfilRepository.existsByDesignacaoIgnoreCase(designacao)) {
            erros.put("designacao", "Esta designação já está em uso");
        }
    }
    
    // Validação da descrição - SÓ VALIDA SE TIVER CONTEÚDO
    if (perfil.getDescricao() != null && !perfil.getDescricao().trim().isEmpty()) {
        String descricao = perfil.getDescricao().trim();
        
        if (descricao.length() > 200) {
            erros.put("descricao", "A descrição não pode exceder 200 caracteres");
        } else if (!DESCRICAO_PATTERN.matcher(descricao).matches()) {
            erros.put("descricao", "A descrição contém caracteres inválidos");
        }
    }
    
    // Se houver erros, retornar com status 400
    if (!erros.isEmpty()) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro de validação");
        response.put("erros", erros);
        return ResponseEntity.badRequest().body(response);
    }
    
    try {
        Perfil perfilModel = perfilRepository.save(perfil);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", true);
        response.put("mensagem", "Perfil cadastrado com sucesso");
        response.put("perfil", perfilModel);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro ao cadastrar perfil: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
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


// Endpoint para editar perfil
@PutMapping("/perfil_editar/{id}")
public ResponseEntity<?> editarPerfil(@PathVariable Integer id, @RequestBody Perfil perfil) {
    
    Map<String, String> erros = new HashMap<>();
    
    // Verificar se o perfil existe
    Optional<Perfil> perfilExistente = perfilRepository.findById(id);
    if (!perfilExistente.isPresent()) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Perfil não encontrado");
        return ResponseEntity.badRequest().body(response);
    }
    
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
        } else if (perfilRepository.existsByDesignacaoIgnoreCaseAndPkPerfilNot(designacao, id)) {
            erros.put("designacao", "Esta designação já está em uso por outro perfil");
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
    
    // Se houver erros, retornar com status 400
    if (!erros.isEmpty()) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro de validação");
        response.put("erros", erros);
        return ResponseEntity.badRequest().body(response);
    }
    
    try {
        Perfil perfilAtual = perfilExistente.get();
        perfilAtual.setDesignacao(perfil.getDesignacao().trim());
        perfilAtual.setDescricao(perfil.getDescricao() != null ? perfil.getDescricao().trim() : null);
        perfilAtual.setEstado(perfil.getEstado());
        
        Perfil perfilModel = perfilRepository.save(perfilAtual);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", true);
        response.put("mensagem", "Perfil atualizado com sucesso");
        response.put("perfil", perfilModel);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro ao atualizar perfil: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}

// Endpoint para buscar perfil por ID
@GetMapping("/perfil_buscar/{id}")
public ResponseEntity<?> buscarPerfil(@PathVariable Integer id) {
    try {
        Optional<Perfil> perfil = perfilRepository.findById(id);
        
        if (perfil.isPresent()) {
            return ResponseEntity.ok(perfil.get());
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Perfil não encontrado");
            return ResponseEntity.badRequest().body(response);
        }
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro ao buscar perfil: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}

// Endpoint para histórico (exemplo)
@GetMapping("/perfil_historico/{id}")
public ResponseEntity<?> historicoPerfil(@PathVariable Integer id) {
    try {
        // Dados de exemplo - substitua por consulta real ao banco
        List<Map<String, Object>> historico = new ArrayList<>();
        
        // Exemplo 1
        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1);
        item1.put("acao", "Cadastro");
        item1.put("usuario", "admin");
        item1.put("data", LocalDateTime.now().minusDays(2));
        item1.put("detalhes", "Perfil criado inicialmente");
        historico.add(item1);
        
        // Exemplo 2
        Map<String, Object> item2 = new HashMap<>();
        item2.put("id", 2);
        item2.put("acao", "Atualização");
        item2.put("usuario", "admin");
        item2.put("data", LocalDateTime.now().minusDays(1));
        item2.put("detalhes", "Estado alterado para ATIVO");
        historico.add(item2);
        
        // Exemplo 3
        Map<String, Object> item3 = new HashMap<>();
        item3.put("id", 3);
        item3.put("acao", "Atualização");
        item3.put("usuario", "moderador");
        item3.put("data", LocalDateTime.now());
        item3.put("detalhes", "Descrição atualizada");
        historico.add(item3);
        
        return ResponseEntity.ok(historico);
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("sucesso", false);
        response.put("mensagem", "Erro ao carregar histórico");
        return ResponseEntity.badRequest().body(response);
    }
}




}
