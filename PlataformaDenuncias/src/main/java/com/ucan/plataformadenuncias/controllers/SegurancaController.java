package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.dto.ContaPerfilDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadeDTO;
import com.ucan.plataformadenuncias.dto.FuncionalidadePerfilDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.initializer.TipoFuncionalidadeLoader;
import com.ucan.plataformadenuncias.repositories.*;
import com.ucan.plataformadenuncias.services.VersaoService;
import jakarta.validation.Valid;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

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

    // Método auxiliar para converter estado inteiro em string
    private String converterEstadoPerfil(Integer estado) {
        if (estado == null) {
            return "ATIVO"; // Valor padrão
        }
        switch (estado) {
            case 1:
                return "ATIVO";
            case 0:
                return "INATIVO";
            case 2:
                return "SUSPENSO";
            default:
                return "DESCONHECIDO";
        }
    }

    @GetMapping("/")
    public String index() {
        return "Segurança ON";
    }

    @GetMapping("/funcionalidade_listar")
    public ResponseEntity<?> listarFuncionalidade() {
        try {
            List<Funcionalidade> funcionalidades = funcionalidadeRepository.findAll();
            
            if (funcionalidades.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("sucesso", true);
                response.put("mensagem", "Nenhuma funcionalidade encontrada");
                response.put("dados", new ArrayList<>());
                return ResponseEntity.ok(response);
            }
            
            List<FuncionalidadeDTO> listaFuncionalidade = new ArrayList<>();
            
            for (Funcionalidade funcionalidade : funcionalidades) {
                FuncionalidadeDTO funcionalidadeDTO = new FuncionalidadeDTO();
                funcionalidadeDTO.setPkFuncionalidade(funcionalidade.getPkFuncionalidade());
                funcionalidadeDTO.setDesignacao(funcionalidade.getDesignacao());
                funcionalidadeDTO.setDescricao(funcionalidade.getDescricao());
                funcionalidadeDTO.setCreatedAt(funcionalidade.getCreatedAt());
                funcionalidadeDTO.setUpdatedAt(funcionalidade.getUpdatedAt());
                funcionalidadeDTO.setUrl(funcionalidade.getUrl());
                funcionalidadeDTO.setGrupo(funcionalidade.getGrupo());
                funcionalidadeDTO.setFuncionalidadesPartilhadas(funcionalidade.getFuncionalidadesPartilhadas());
                
                // Tipo de funcionalidade
                if (funcionalidade.getFkTipoFuncionalidade() != null) {
                    funcionalidadeDTO.setFkTipoFuncionalidade(funcionalidade.getFkTipoFuncionalidade().getPkTipoFuncionalidade());
                    funcionalidadeDTO.setDesignacaoTipoFuncionalidade(funcionalidade.getFkTipoFuncionalidade().getDesignacao());
                }
                
                // Funcionalidade pai (se houver)
                if (funcionalidade.getFkFuncionalidade() != null) {
                    funcionalidadeDTO.setFkFuncionalidade(funcionalidade.getFkFuncionalidade().getPkFuncionalidade());
                }
                
                listaFuncionalidade.add(funcionalidadeDTO);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Funcionalidades listadas com sucesso");
            response.put("dados", listaFuncionalidade);
            response.put("total", listaFuncionalidade.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar funcionalidades: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/tipos_funcionalidade_listar")
    public ResponseEntity<?> listarTiposFuncionalidade() {
        try {
            List<TipoFuncionalidade> tipos = tipoFuncionalidadeRepository.findAll();
            
            List<Map<String, Object>> tiposList = tipos.stream()
                .map(tipo -> {
                    Map<String, Object> tipoMap = new HashMap<>();
                    tipoMap.put("pkTipoFuncionalidade", tipo.getPkTipoFuncionalidade());
                    tipoMap.put("designacao", tipo.getDesignacao());
                    return tipoMap;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("dados", tiposList);
            response.put("total", tiposList.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar tipos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/conta_listar")
    public ResponseEntity<?> listarConta() {
        try {
            List<Conta> contas = contaRepository.findAll();
            return ResponseEntity.ok(contas);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar contas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/perfil_listar")
    public ResponseEntity<?> listarPerfil() {
        try {
            List<Perfil> perfis = perfilRepository.findAll();
            return ResponseEntity.ok(perfis);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar perfis: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/conta_perfil_listar")
    public ResponseEntity<?> listarContaPerfil() {
        try {
            List<ContaPerfil> contaPerfis = contaPerfilRepository.findAll();
            List<ContaPerfilDTO> listContaPerfil = new ArrayList<>();

            for (ContaPerfil contaPerfil : contaPerfis) {
                ContaPerfilDTO contaPerfilDTO = new ContaPerfilDTO();

                contaPerfilDTO.setFkPerfil(contaPerfil.getFkPerfil().getPkPerfil());
                contaPerfilDTO.setFkConta(contaPerfil.getFkConta().getPkConta());

                contaPerfilDTO.setEmail(contaPerfil.getFkConta().getEmail());
                contaPerfilDTO.setTipoConta(contaPerfil.getFkConta().getTipoConta().name());
                //contaPerfilDTO.setNomeCompleto(contaPerfil.getFkConta().getNomeCompleto());
                contaPerfilDTO.setEstado(contaPerfil.getStatus());
                contaPerfilDTO.setDesignacaoPerfil(contaPerfil.getFkPerfil().getDesignacao());

                listContaPerfil.add(contaPerfilDTO);
            }

            return ResponseEntity.ok(listContaPerfil);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar conta-perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/funcionalidade_perfil_listar")
    public ResponseEntity<?> listarFuncionalidadePerfil() {
        try {
            List<FuncionalidadePerfil> funcionalidadePerfis = funcionalidadePerfilRepository.findAll();
            List<FuncionalidadePerfilDTO> listFuncionalidadePerfil = new ArrayList<>();

            for (FuncionalidadePerfil funcionalidadePerfilModel : funcionalidadePerfis) {
                FuncionalidadePerfilDTO funcionalidadePerfilDTO = new FuncionalidadePerfilDTO();
                funcionalidadePerfilDTO.setNomePerfil(funcionalidadePerfilModel.getFkPerfil().getDesignacao());
                funcionalidadePerfilDTO.setNomeFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getDescricao());

                funcionalidadePerfilDTO.setFkPerfil(funcionalidadePerfilModel.getFkPerfil().getPkPerfil());
                funcionalidadePerfilDTO.setFkFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getPkFuncionalidade());

                if (funcionalidadePerfilModel.getFkFuncionalidade().getFkTipoFuncionalidade() != null) {
                    funcionalidadePerfilDTO.setTipoFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getFkTipoFuncionalidade().getDesignacao());
                }

                funcionalidadePerfilDTO.setDetalhePerfil(funcionalidadePerfilModel.getFkPerfil().getDescricao());
                funcionalidadePerfilDTO.setDetalheFuncionalidade(funcionalidadePerfilModel.getFkFuncionalidade().getDescricao());

                funcionalidadePerfilDTO.setPaiFuncionalidade(funcionalidadePerfilModel.getFkPerfil().getDesignacao());
                
                // CORREÇÃO: Converter estado inteiro para string
                Integer estadoInt = funcionalidadePerfilModel.getFkPerfil().getEstado();
                String estadoStr = converterEstadoPerfil(estadoInt);
                funcionalidadePerfilDTO.setEstadoPerfil(estadoStr);

                listFuncionalidadePerfil.add(funcionalidadePerfilDTO);
            }

            return ResponseEntity.ok(listFuncionalidadePerfil);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao listar funcionalidade-perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/conta_cadastrar")
    public ResponseEntity<?> cadastrarConta(@RequestBody Conta conta) {
        try {
            Conta contaModel = contaRepository.save(conta);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Conta cadastrada com sucesso");
            response.put("conta", contaModel);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao cadastrar conta: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/perfil_cadastrar")
    public ResponseEntity<?> cadastrarPerfil(@RequestBody Perfil perfil) {
        
        Map<String, String> erros = new HashMap<>();
        
        // Validação da designação
        if (perfil.getDesignacao() == null || perfil.getDesignacao().trim().isEmpty()) {
            erros.put("designacao", "A designação é obrigatória");
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
            // Se estado não for fornecido, definir como ativo (1)
            if (perfil.getEstado() == null) {
                perfil.setEstado(1);
            }
            
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
    public ResponseEntity<?> cadastrarContaPerfil(@RequestBody ContaPerfilDTO contaPerfilDTO) {
        try {
            Perfil perfilModel = new Perfil();
            Conta contaModel = new Conta();
            ContaPerfil contaPerfilModel = new ContaPerfil();

            perfilModel.setPkPerfil(contaPerfilDTO.getFkPerfil());
            contaModel.setPkConta(contaPerfilDTO.getFkConta());
           // contaModel.setNomeCompleto(contaPerfilDTO.getNomeCompleto());
            contaModel.setEmail(contaPerfilDTO.getEmail());

            contaPerfilModel.setFkPerfil(perfilModel);
            contaPerfilModel.setFkConta(contaModel);

            ContaPerfil contaPerfilModelAux = contaPerfilRepository.save(contaPerfilModel);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Conta-Perfil cadastrado com sucesso");
            response.put("contaPerfil", contaPerfilModelAux);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao cadastrar conta-perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/funcionalidade_cadastrar")
    public ResponseEntity<?> cadastrarFuncionalidade(@RequestBody Funcionalidade funcionalidade) {
        try {
            Funcionalidade funcionalidadeModel = funcionalidadeRepository.save(funcionalidade);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Funcionalidade cadastrada com sucesso");
            response.put("funcionalidade", funcionalidadeModel);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao cadastrar funcionalidade: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/funcionalidade_perfil_cadastrar")
    public ResponseEntity<?> cadastrarFuncionalidadePerfil(@RequestBody FuncionalidadePerfilDTO funcionalidadePerfilDTO) {
        try {
            Funcionalidade funcionalidadeModel = new Funcionalidade();
            Perfil perfilModel = new Perfil();
            FuncionalidadePerfil funcionalidadePerfilModel = new FuncionalidadePerfil();

            funcionalidadeModel.setPkFuncionalidade(funcionalidadePerfilDTO.getFkFuncionalidade());
            perfilModel.setPkPerfil(funcionalidadePerfilDTO.getFkPerfil());

            funcionalidadePerfilModel.setFkFuncionalidade(funcionalidadeModel);
            funcionalidadePerfilModel.setFkPerfil(perfilModel);
            funcionalidadePerfilModel.setDetalhe(funcionalidadePerfilDTO.getDetalhe());

            funcionalidadePerfilRepository.save(funcionalidadePerfilModel);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Funcionalidade-Perfil cadastrado com sucesso");
            response.put("funcionalidadePerfil", funcionalidadePerfilModel);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao cadastrar funcionalidade-perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/funcionalidade_editar/{id}")
    public ResponseEntity<?> editarFuncionalidade(@PathVariable int id, @RequestBody Funcionalidade funcionalidade) {
        try {
            funcionalidade.setPkFuncionalidade(id);
            Funcionalidade funcionalidadeAtualizada = funcionalidadeRepository.save(funcionalidade);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Funcionalidade editada com sucesso");
            response.put("funcionalidade", funcionalidadeAtualizada);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao editar funcionalidade: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/funcionalidade_importar")
    public ResponseEntity<?> importar(@RequestParam("file") MultipartFile file) {
        System.out.println("=== INICIANDO IMPORTAÇÃO DE DUAS FOLHAS ===");
        
        try {
            Map<String, Object> resultado = TipoFuncionalidadeLoader.insertBothSheets(
                file, tipoFuncionalidadeRepository, funcionalidadeRepository, versaoService);
            
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

    @PutMapping("/perfil_editar/{id}")
    public ResponseEntity<?> editarPerfil(@PathVariable Integer id, @RequestBody Perfil perfil) {
        
        Map<String, String> erros = new HashMap<>();
        
        Optional<Perfil> perfilExistente = perfilRepository.findById(id);
        if (!perfilExistente.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", false);
            response.put("mensagem", "Perfil não encontrado");
            return ResponseEntity.badRequest().body(response);
        }
        
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
        
        if (perfil.getDescricao() != null && !perfil.getDescricao().trim().isEmpty()) {
            String descricao = perfil.getDescricao().trim();
            
            if (descricao.length() > 200) {
                erros.put("descricao", "A descrição não pode exceder 200 caracteres");
            } else if (!DESCRICAO_PATTERN.matcher(descricao).matches()) {
                erros.put("descricao", "A descrição contém caracteres inválidos");
            }
        }
        
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

    @GetMapping("/perfil_historico/{id}")
    public ResponseEntity<?> historicoPerfil(@PathVariable Integer id) {
        try {
            List<Map<String, Object>> historico = new ArrayList<>();
            
            Map<String, Object> item1 = new HashMap<>();
            item1.put("id", 1);
            item1.put("acao", "Cadastro");
            item1.put("usuario", "admin");
            item1.put("data", LocalDateTime.now().minusDays(2));
            item1.put("detalhes", "Perfil criado inicialmente");
            historico.add(item1);
            
            Map<String, Object> item2 = new HashMap<>();
            item2.put("id", 2);
            item2.put("acao", "Atualização");
            item2.put("usuario", "admin");
            item2.put("data", LocalDateTime.now().minusDays(1));
            item2.put("detalhes", "Estado alterado para ATIVO");
            historico.add(item2);
            
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

    @DeleteMapping("/perfil_excluir/{id}")
    public ResponseEntity<?> excluirPerfil(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Perfil> perfilExistente = perfilRepository.findById(id);
            
            if (!perfilExistente.isPresent()) {
                response.put("sucesso", false);
                response.put("mensagem", "Perfil não encontrado");
                return ResponseEntity.badRequest().body(response);
            }
            
            Perfil perfil = perfilExistente.get();
            
            Long countContas = contaPerfilRepository.countByFkPerfil(perfil);
            if (countContas != null && countContas > 0) {
                response.put("sucesso", false);
                response.put("mensagem", "Não é possível excluir o perfil pois está associado a " + 
                           countContas + " conta(s)");
                return ResponseEntity.badRequest().body(response);
            }
            
            Long countFuncionalidades = funcionalidadePerfilRepository.countByFkPerfil(perfil);
            if (countFuncionalidades != null && countFuncionalidades > 0) {
                response.put("sucesso", false);
                response.put("mensagem", "Não é possível excluir o perfil pois está associado a " + 
                           countFuncionalidades + " funcionalidade(s)");
                return ResponseEntity.badRequest().body(response);
            }
            
            perfilRepository.deleteById(id);
            
            response.put("sucesso", true);
            response.put("mensagem", "Perfil excluído com sucesso");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao excluir perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/funcionalidade_perfil_excluir")
    public ResponseEntity<?> excluirFuncionalidadePerfil(@RequestBody FuncionalidadePerfilDTO funcionalidadePerfilDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Buscar a associação específica
            Optional<Perfil> perfilOpt = perfilRepository.findById(funcionalidadePerfilDTO.getFkPerfil());
            Optional<Funcionalidade> funcionalidadeOpt = funcionalidadeRepository.findById(funcionalidadePerfilDTO.getFkFuncionalidade());
            
            if (!perfilOpt.isPresent() || !funcionalidadeOpt.isPresent()) {
                response.put("sucesso", false);
                response.put("mensagem", "Perfil ou funcionalidade não encontrados");
                return ResponseEntity.badRequest().body(response);
            }
            
            Perfil perfil = perfilOpt.get();
            Funcionalidade funcionalidade = funcionalidadeOpt.get();
            
            List<FuncionalidadePerfil> associacoes = funcionalidadePerfilRepository.findByFkPerfil(perfil);
            
            FuncionalidadePerfil associacaoParaExcluir = null;
            for (FuncionalidadePerfil fp : associacoes) {
                if (fp.getFkFuncionalidade().getPkFuncionalidade().equals(funcionalidade.getPkFuncionalidade())) {
                    associacaoParaExcluir = fp;
                    break;
                }
            }
            
            if (associacaoParaExcluir == null) {
                response.put("sucesso", false);
                response.put("mensagem", "Associação não encontrada");
                return ResponseEntity.badRequest().body(response);
            }
            
            funcionalidadePerfilRepository.delete(associacaoParaExcluir);
            
            response.put("sucesso", true);
            response.put("mensagem", "Funcionalidade removida do perfil com sucesso");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("sucesso", false);
            response.put("mensagem", "Erro ao remover funcionalidade do perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verificar_estrutura_arquivo")
    public ResponseEntity<?> verificarEstruturaArquivo(@RequestParam("file") MultipartFile file) {
        Map<String, Object> resultado = new HashMap<>();
        
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {
            
            resultado.put("total_folhas", workbook.getNumberOfSheets());
            
            List<Map<String, Object>> infoFolhas = new ArrayList<>();
            
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                Map<String, Object> infoFolha = new HashMap<>();
                infoFolha.put("indice", i);
                infoFolha.put("nome", workbook.getSheetName(i));
                infoFolha.put("total_linhas", sheet.getLastRowNum() + 1);
                
                List<List<String>> primeirasLinhas = new ArrayList<>();
                for (int j = 0; j < Math.min(5, sheet.getLastRowNum() + 1); j++) {
                    Row row = sheet.getRow(j);
                    List<String> linha = new ArrayList<>();
                    if (row != null) {
                        for (int k = 0; k < Math.min(10, row.getLastCellNum()); k++) {
                            Cell cell = row.getCell(k);
                            linha.add(FuncionsHelper.getCellAsString(cell));
                        }
                    }
                    primeirasLinhas.add(linha);
                }
                infoFolha.put("primeiras_linhas", primeirasLinhas);
                
                infoFolhas.add(infoFolha);
            }
            
            resultado.put("folhas", infoFolhas);
            resultado.put("sucesso", true);
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            resultado.put("erro", "Erro ao verificar arquivo: " + e.getMessage());
            resultado.put("sucesso", false);
            return ResponseEntity.badRequest().body(resultado);
        }
    }
}
