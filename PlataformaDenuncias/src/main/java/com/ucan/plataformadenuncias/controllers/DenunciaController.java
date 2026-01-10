package com.ucan.plataformadenuncias.controllers;

import com.ucan.plataformadenuncias.dto.DenunciaRequestDTO;
import com.ucan.plataformadenuncias.dto.DenunciaResponseDTO;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.repositories.*;
import com.ucan.plataformadenuncias.enumerable.TipoLocalidade;
import com.ucan.plataformadenuncias.services.DenunciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/denuncias")
@CrossOrigin(origins = "*")
public class DenunciaController {

    @Autowired
    private DenunciaService denunciaService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private LocalidadeRepository localidadeRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private GeneroRepository generoRepository; // ADICIONADO: Repositório para buscar gêneros

    // 🔧 ADICIONE @Transactional(readOnly = true) AQUI
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DenunciaResponseDTO>> listar() {
        List<Denuncia> denuncias = denunciaService.listarTodas();
        
        // Converter para DTO para evitar problemas de serialização
        List<DenunciaResponseDTO> dtos = denuncias.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrar(@RequestBody DenunciaRequestDTO requestDTO) {
        try {
            System.out.println("📥 DTO recebido do frontend: " + requestDTO);
            System.out.println("📥 Municipio: " + requestDTO.getMunicipio());
            System.out.println("📥 Bairro: " + requestDTO.getBairro());
            System.out.println("📥 Email recebido: " + requestDTO.getEmail());
            System.out.println("📥 Tipo Específico recebido: " + requestDTO.getTipoEspecifico());
            System.out.println("📥 Subtipo recebido: " + requestDTO.getSubtipo());
            
            Denuncia denuncia = new Denuncia();

            // 🔧 Usar dados do DTO
            denuncia.setNome(requestDTO.getNome());
            denuncia.setDescricaoDetalhada(requestDTO.getDescricaoDetalhada());
            denuncia.setTipoEspecifico(requestDTO.getTipoEspecifico());
            denuncia.setSubtipo(requestDTO.getSubtipo());
            denuncia.setAnexo(requestDTO.getAnexo());
            denuncia.setLocalEspecificoDaOcorrencia(requestDTO.getLocalEspecificoDaOcorrencia());
            denuncia.setAnonima(requestDTO.isAnonima());
            
            // ✅✅✅ CORREÇÃO CRÍTICA: Usar data/hora atual, não LocalDateTime.MIN
            denuncia.setDataRegistro(LocalDateTime.now());
            System.out.println("✅ Data do registro definida: " + LocalDateTime.now());

            if (!requestDTO.isAnonima()) {
       //         denuncia.setContacto(requestDTO.getContacto());
                
                // ✅✅✅ CORREÇÃO CRÍTICA: Processar email corretamente
                if (requestDTO.getEmail() != null && !requestDTO.getEmail().trim().isEmpty()) {
                    denuncia.setEmail(requestDTO.getEmail().trim());
                    System.out.println("✅ Email definido: " + requestDTO.getEmail().trim());
                } else {
                    denuncia.setEmail(null);
                    System.out.println("ℹ️ Email não informado ou vazio");
                }
                
                // 🔧 Buscar ou criar pessoa (SEM contacto, apenas por nome/email)
                Pessoa pessoa = buscarOuCriarPessoa(requestDTO);
                if (pessoa != null) {
                    denuncia.setPessoa(pessoa);
                }
            } else {
                // Se for anônimo, garantir que email seja null
                denuncia.setEmail(null);
     //           denuncia.setContacto(null);
                System.out.println("ℹ️ Denúncia anônima - email e contacto não serão salvos");
            }

            // 🔧 Data da ocorrência
            if (requestDTO.getDataOcorrecia() != null) {
                denuncia.setDataOcorrecia(requestDTO.getDataOcorrecia());
            } else {
                denuncia.setDataOcorrecia(LocalDate.now());
            }

            // 🔧 CORREÇÃO: Buscar ou criar Categoria
            Categoria categoria = null;
            String categoriaNome = requestDTO.getCategoriaNome();
            
            if (categoriaNome != null && !categoriaNome.trim().isEmpty()) {
                categoria = categoriaRepository.findByNome(categoriaNome.trim())
                    .orElse(null);
            }
            
            if (categoria == null) {
                categoria = new Categoria();
                categoria.setNome(categoriaNome != null ? categoriaNome.trim() : "Água");
                // Criar localidade padrão se necessário
                categoria.setLocalidade(obterOuCriarLocalidadePadrao());
                categoria = categoriaRepository.save(categoria);
                System.out.println("✅ Nova categoria criada: " + categoria.getNome());
            }
            
            denuncia.setCategoria(categoria);

            // 🔧🔧🔧 CORREÇÃO CRÍTICA: Lógica corrigida para Localidade
            Localidade localidadeBairro = null;
            String municipioNome = requestDTO.getMunicipio();
            String bairroNome = requestDTO.getBairro();
            
            System.out.println("🔍 Processando localidade: Município=" + municipioNome + ", Bairro=" + bairroNome);
            
            // 1. Buscar ou criar o Município (tipo MUNICIPIO)
            Localidade municipio = null;
            if (municipioNome != null && !municipioNome.trim().isEmpty()) {
                municipio = localidadeRepository.findByNomeAndTipo(municipioNome.trim(), TipoLocalidade.MUNICIPIO)
                    .orElse(null);
                
                if (municipio == null) {
                    System.out.println("📍 Criando novo município: " + municipioNome);
                    municipio = new Localidade();
                    municipio.setNome(municipioNome.trim());
                    municipio.setTipo(TipoLocalidade.MUNICIPIO);
                    municipio = localidadeRepository.save(municipio);
                    System.out.println("✅ Município criado: " + municipio.getNome() + " (ID: " + municipio.getPkLocalidade() + ")");
                }
            } else {
                // Usar Luanda como padrão se não especificado
                municipio = localidadeRepository.findByNomeAndTipo("Luanda", TipoLocalidade.MUNICIPIO)
                    .orElseGet(() -> {
                        Localidade novo = new Localidade();
                        novo.setNome("Luanda");
                        novo.setTipo(TipoLocalidade.MUNICIPIO);
                        return localidadeRepository.save(novo);
                    });
            }

            // 2. Buscar ou criar o Bairro (tipo BAIRRO) com o município como pai
            if (bairroNome != null && !bairroNome.trim().isEmpty()) {
                localidadeBairro = localidadeRepository.findByNomeAndLocalidadePai(bairroNome.trim(), municipio)
                    .orElse(null);
                
                if (localidadeBairro == null) {
                    System.out.println("📍 Criando novo bairro: " + bairroNome + " no município " + municipio.getNome());
                    localidadeBairro = new Localidade();
                    localidadeBairro.setNome(bairroNome.trim());
                    localidadeBairro.setTipo(TipoLocalidade.BAIRRO);
                    localidadeBairro.setLocalidadePai(municipio);
                    localidadeBairro.setNomeRua(requestDTO.getNomeRua());
                    localidadeBairro = localidadeRepository.save(localidadeBairro);
                    System.out.println("✅ Bairro criado: " + localidadeBairro.getNome() + " (ID: " + localidadeBairro.getPkLocalidade() + ")");
                }
            } else {
                // Se não tem bairro, usar o próprio município como localidade
                localidadeBairro = municipio;
            }

            denuncia.setLocalidade(localidadeBairro);
            System.out.println("✅ Localidade definida: " + localidadeBairro.getNome() + 
                              " (Tipo: " + localidadeBairro.getTipo() + ")");

            // Salvar a denúncia
            Denuncia denunciaSalva = denunciaService.salvar(denuncia);
            System.out.println("✅ Denúncia salva com sucesso! ID: " + denunciaSalva.getPkDenuncia());
            System.out.println("✅ Email salvo: " + denunciaSalva.getEmail());
            System.out.println("✅ Tipo Específico salvo: " + denunciaSalva.getTipoEspecifico());
            System.out.println("✅ Subtipo salvo: " + denunciaSalva.getSubtipo());
          //  System.out.println("✅ Contacto salvo na denúncia: " + denunciaSalva.getContacto());
            System.out.println("✅ DataRegistro salvo: " + denunciaSalva.getDataRegistro());
//            System.out.println("✅ Província salva: " + denunciaSalva.getProvincia());
            
            // Retornar o DTO
            DenunciaResponseDTO responseDTO = converterParaDTO(denunciaSalva);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Erro ao registrar denúncia: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(
                Map.of(
                    "erro", "Falha ao registrar denúncia: " + e.getMessage(),
                    "detalhes", e.toString()
                )
            );
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📤 Recebendo arquivo: " + file.getOriginalFilename());
            System.out.println("📤 Tamanho: " + file.getSize() + " bytes");
            System.out.println("📤 Tipo MIME: " + file.getContentType());
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio");
            }
            
            // Validar tipo de arquivo
            String[] tiposPermitidos = {
                "image/jpeg", "image/jpg", "image/png", 
                "application/pdf", 
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };
            
            boolean tipoValido = false;
            String contentType = file.getContentType();
            if (contentType != null) {
                for (String tipo : tiposPermitidos) {
                    if (contentType.equalsIgnoreCase(tipo)) {
                        tipoValido = true;
                        break;
                    }
                }
            }
            
            if (!tipoValido) {
                return ResponseEntity.badRequest().body("Tipo de arquivo não permitido");
            }
            
            // Validar tamanho (5MB máximo)
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest().body("Arquivo muito grande (máximo 5MB)");
            }
            
            // ✅ CORREÇÃO: Sempre usar o diretório temporário do sistema (garantido que existe)
            String tempDir = System.getProperty("java.io.tmpdir");
            
            // Garantir que o separador de diretório está correto
            String uploadDirPath;
            if (tempDir.endsWith(File.separator)) {
                uploadDirPath = tempDir + "uploads_denuncias" + File.separator;
            } else {
                uploadDirPath = tempDir + File.separator + "uploads_denuncias" + File.separator;
            }
            
            File uploadDir = new File(uploadDirPath);
            System.out.println("📁 Diretório de upload: " + uploadDir.getAbsolutePath());
            
            // Criar diretório se não existir
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                System.out.println("📁 Diretório criado? " + created);
                if (!created) {
                    System.err.println("❌ Não foi possível criar o diretório: " + uploadDir.getAbsolutePath());
                    // Fallback: usar apenas o temp dir
                    uploadDir = new File(tempDir);
                    System.out.println("📁 Usando diretório temporário como fallback: " + uploadDir.getAbsolutePath());
                }
            }
            
            // Gerar nome único para o arquivo
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                // Fallback para extensão baseada no tipo MIME
                if (contentType != null) {
                    if (contentType.equals("image/jpeg") || contentType.equals("image/jpg")) {
                        fileExtension = ".jpg";
                    } else if (contentType.equals("image/png")) {
                        fileExtension = ".png";
                    } else if (contentType.equals("application/pdf")) {
                        fileExtension = ".pdf";
                    } else if (contentType.equals("application/msword")) {
                        fileExtension = ".doc";
                    } else if (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                        fileExtension = ".docx";
                    }
                }
            }
            
            String uniqueFilename = "upload_" + System.currentTimeMillis() + "_" + 
                                   UUID.randomUUID().toString().substring(0, 8) + 
                                   fileExtension;
            
            File dest = new File(uploadDir, uniqueFilename);
            System.out.println("💾 Salvando arquivo em: " + dest.getAbsolutePath());
            
            // Verificar se o diretório pai existe
            File parentDir = dest.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                System.out.println("📁 Criando diretório pai: " + parentDir.getAbsolutePath());
                parentDir.mkdirs();
            }
            
            // Salvar arquivo
            file.transferTo(dest);
            System.out.println("✅ Arquivo salvo com sucesso: " + uniqueFilename);
            System.out.println("✅ Tamanho do arquivo salvo: " + dest.length() + " bytes");
            System.out.println("✅ Caminho completo: " + dest.getAbsolutePath());
            
            // Retornar apenas o nome do arquivo
            return ResponseEntity.ok(uniqueFilename);
            
        } catch (IOException e) {
            System.err.println("❌ Erro de IO ao salvar arquivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao salvar arquivo: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Erro inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro inesperado: " + e.getMessage());
        }
    }

    // ✅ ADICIONE ESTE MÉTODO PARA TESTAR O DIRETÓRIO DE UPLOAD
    @GetMapping("/upload-info")
    public ResponseEntity<Map<String, Object>> getUploadInfo() {
        Map<String, Object> info = new HashMap<>();
        
        // Informações do sistema
        info.put("java.io.tmpdir", System.getProperty("java.io.tmpdir"));
        info.put("user.dir", System.getProperty("user.dir"));
        info.put("user.home", System.getProperty("user.home"));
        info.put("os.name", System.getProperty("os.name"));
        
        // Testar diretórios possíveis
        List<Map<String, Object>> directories = new ArrayList<>();
        
        String[] possibleDirs = {
            System.getProperty("java.io.tmpdir") + File.separator + "uploads_denuncias",
            System.getProperty("user.dir") + File.separator + "uploads",
            System.getProperty("user.home") + File.separator + "uploads_denuncias",
            "/tmp/uploads",
            "/tmp/uploads_denuncias"
        };
        
        for (String dirPath : possibleDirs) {
            Map<String, Object> dirInfo = new HashMap<>();
            File dir = new File(dirPath);
            dirInfo.put("path", dirPath);
            dirInfo.put("absolutePath", dir.getAbsolutePath());
            dirInfo.put("exists", dir.exists());
            dirInfo.put("isDirectory", dir.isDirectory());
            dirInfo.put("canWrite", dir.canWrite());
            directories.add(dirInfo);
        }
        
        info.put("directories", directories);
        
        return ResponseEntity.ok(info);
    }

    // Método auxiliar para converter Denuncia para DTO
    private DenunciaResponseDTO converterParaDTO(Denuncia denuncia) {
        DenunciaResponseDTO dto = new DenunciaResponseDTO();
        dto.setPkDenuncia(denuncia.getPkDenuncia());
        dto.setNome(denuncia.getNome());
        dto.setDescricaoDetalhada(denuncia.getDescricaoDetalhada());
        dto.setTipoEspecifico(denuncia.getTipoEspecifico());
        dto.setSubtipo(denuncia.getSubtipo());
        dto.setAnexo(denuncia.getAnexo());
        dto.setLocalEspecificoDaOcorrencia(denuncia.getLocalEspecificoDaOcorrencia());
        dto.setAnonima(denuncia.isAnonima());
//        dto.setContacto(denuncia.getContacto());
        dto.setEmail(denuncia.getEmail()); 
        dto.setDataOcorrecia(denuncia.getDataOcorrecia());
        
        // ✅✅✅ CORREÇÃO CRÍTICA: Enviar dataRegistro no DTO
        dto.setDataRegistro(denuncia.getDataRegistro());
        System.out.println("📤 Enviando dataRegistro no DTO: " + denuncia.getDataRegistro());
        
        // ✅✅✅ CORREÇÃO CRÍTICA: Enviar província no DTO
//        dto.setProvincia(denuncia.getProvincia());
  //      System.out.println("📤 Enviando província no DTO: " + denuncia.getProvincia());
        
        // 🔧 ADICIONE TRY-CATCH PARA EVITAR LAZYINITIALIZATIONEXCEPTION
        try {
            // Extrair informações da localidade
            if (denuncia.getLocalidade() != null) {
                Localidade localidade = denuncia.getLocalidade();
                dto.setBairro(localidade.getNome());
                dto.setNomeRua(localidade.getNomeRua());
                
                // Tentar obter o município pai
                if (localidade.getLocalidadePai() != null) {
                    dto.setMunicipio(localidade.getLocalidadePai().getNome());
                } else {
                    dto.setMunicipio(localidade.getNome()); // Se não tiver pai, assume que é o município
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao acessar localidade: " + e.getMessage());
            dto.setBairro(null);
            dto.setNomeRua(null);
            dto.setMunicipio(null);
        }
        
        try {
            // Extrair categoria
            if (denuncia.getCategoria() != null) {
                dto.setCategoriaNome(denuncia.getCategoria().getNome());
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao acessar categoria: " + e.getMessage());
            dto.setCategoriaNome(null);
        }
        
        return dto;
    }

    // Método auxiliar para obter ou criar localidade padrão
    private Localidade obterOuCriarLocalidadePadrao() {
        return localidadeRepository.findByNomeAndTipo("Luanda", TipoLocalidade.MUNICIPIO)
            .orElseGet(() -> {
                Localidade localidadePadrao = new Localidade();
                localidadePadrao.setNome("Luanda");
                localidadePadrao.setTipo(TipoLocalidade.MUNICIPIO);
                return localidadeRepository.save(localidadePadrao);
            });
    }

    // 🔧 MÉTODO PARA DETECTAR GÊNERO PELO NOME (HEURÍSTICA SIMPLES)
    private String detectarGenero(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.trim().isEmpty()) {
            System.out.println("ℹ️ Nome vazio, usando 'Não informado'");
            return "Não informado";
        }
        
        String primeiroNome = nomeCompleto.trim().split(" ")[0];
        String nomeNormalizado = primeiroNome.toLowerCase();
        
        // Remover acentos
        nomeNormalizado = nomeNormalizado
            .replaceAll("[áàâãä]", "a")
            .replaceAll("[éèêë]", "e")
            .replaceAll("[íìîï]", "i")
            .replaceAll("[óòôõö]", "o")
            .replaceAll("[úùûü]", "u")
            .replaceAll("[ç]", "c")
            .replaceAll("[ñ]", "n");
        
        System.out.println("🔍 Analisando gênero para nome: " + primeiroNome + " (normalizado: " + nomeNormalizado + ")");
        
        // Terminações FEMININAS comuns em português
        if (nomeNormalizado.matches(".*(a|e|i|z|ade|ice|ina|ela|ete|lia|nia|ria|sia|tia)$")) {
            // Exceções: nomes masculinos que terminam com 'a'
            if (nomeNormalizado.matches("(joshua|jona|aníbal|anibal|isaias|jeremias|mateus|nicolau|saul|tiago|joaquim|elias|matias|silas)$")) {
                System.out.println("✅ Exceção: nome masculino com terminação 'a'");
                return "Masculino";
            }
            System.out.println("✅ Por terminação, provavelmente Feminino");
            return "Feminino";
        }
        
        // Terminações MASCULINAS comuns em português
        if (nomeNormalizado.matches(".*(o|u|r|s|l|n|m|ão|im|om|um|io|to|do|go|vo)$")) {
            // Exceções: nomes femininos que terminam com 'o'
            if (nomeNormalizado.matches("(cleo|dália|dalila|flávio|glória|indio|júlio|lídio|mário|nívio|ótavio|otavio)$")) {
                System.out.println("✅ Exceção: nome feminino com terminação 'o'");
                return "Feminino";
            }
            System.out.println("✅ Por terminação, provavelmente Masculino");
            return "Masculino";
        }
        
        // Nomes específicos comuns em Angola/Portugal
        if (nomeNormalizado.matches("(maria|ana|sofia|isabel|rita|carla|luisa|luísa|joana|marta|teresa|catarina)$")) {
            System.out.println("✅ Nome feminino conhecido");
            return "Feminino";
        }
        
        if (nomeNormalizado.matches("(joão|jose|josé|antonio|antónio|francisco|carlos|manuel|paulo|pedro|luis|luís|miguel)$")) {
            System.out.println("✅ Nome masculino conhecido");
            return "Masculino";
        }
        
        System.out.println("⚠️ Não foi possível determinar gênero, usando 'Não informado'");
        return "Não informado";
    }

    // 🔧 MÉTODO PARA OBTER OU CRIAR GÊNERO NO BANCO DE DADOS
    private Genero obterOuCriarGenero(String nomeGenero) {
        if (nomeGenero == null || nomeGenero.trim().isEmpty()) {
            nomeGenero = "Não informado";
        }
        
        try {
            // Buscar gênero pelo nome
            Optional<Genero> generoExistente = generoRepository.findByNome(nomeGenero.trim());
            if (generoExistente.isPresent()) {
                return generoExistente.get();
            }
            
            // Se não existir, criar novo gênero
            Genero novoGenero = new Genero();
            novoGenero.setNome(nomeGenero.trim());
            return generoRepository.save(novoGenero);
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao obter/criar gênero: " + e.getMessage());
            // Fallback: criar gênero com ID 1 (deve existir no banco)
            return generoRepository.findById(1)
                .orElseGet(() -> {
                    Genero generoPadrao = new Genero();
                    generoPadrao.setNome("Não informado");
                    return generoRepository.save(generoPadrao);
                });
        }
    }

    // 🔧 MÉTODO ATUALIZADO: Buscar ou criar pessoa (SEM contacto, apenas nome/email)
    private Pessoa buscarOuCriarPessoa(DenunciaRequestDTO requestDTO) {
        String nome = requestDTO.getNome();
        String email = requestDTO.getEmail();
        
        // Verificar se temos dados suficientes para criar/associar pessoa
        if (nome == null || nome.trim().isEmpty() || nome.equals("Não informado")) {
            System.out.println("⚠️ Nome não informado, não será criada/associada pessoa");
            return null;
        }
        
        nome = nome.trim();
        email = (email != null) ? email.trim() : null;
        
        System.out.println("🔍 Buscando pessoa para: Nome=" + nome + " | Email=" + email);
        
        try {
            Pessoa pessoaExistente = null;
            
            // Estratégia de busca simplificada (sem contacto, pois Pessoa não tem contacto)
            
            // 1. Buscar por nome exato
            Optional<Pessoa> pessoaPorNome = pessoaRepository.findByNome(nome);
            if (pessoaPorNome.isPresent()) {
                pessoaExistente = pessoaPorNome.get();
                System.out.println("✅ Pessoa encontrada por nome exato: " + pessoaExistente.getNome());
                
                // ✅ CORREÇÃO: Verificar se fkGenero não é null
                if (pessoaExistente.getFkGenero() == null) {
                    System.out.println("⚠️ Pessoa encontrada mas fkGenero é null. Atualizando...");
                    String generoDetectado = detectarGenero(nome);
                    Genero genero = obterOuCriarGenero(generoDetectado);
                    pessoaExistente.setFkGenero(genero);
                    pessoaExistente = pessoaRepository.save(pessoaExistente);
                    System.out.println("✅ Gênero atualizado para: " + genero.getNome());
                } else {
                    System.out.println("✅ Gênero atual: " + pessoaExistente.getFkGenero().getNome());
                }
            }
            
            // 2. Se não encontrou por nome exato, buscar por nome similar
            if (pessoaExistente == null) {
                List<Pessoa> todasPessoas = pessoaRepository.findAll();
                String primeiroNome = nome.split(" ")[0].toLowerCase();
                
                for (Pessoa p : todasPessoas) {
                    if (p.getNome() != null && p.getNome().trim().length() > 0) {
                        String primeiroNomeExistente = p.getNome().split(" ")[0].toLowerCase();
                        if (primeiroNomeExistente.equals(primeiroNome)) {
                            pessoaExistente = p;
                            System.out.println("✅ Pessoa encontrada por nome similar: " + p.getNome());
                            
                            // ✅ CORREÇÃO: Verificar se fkGenero não é null
                            if (pessoaExistente.getFkGenero() == null) {
                                System.out.println("⚠️ Pessoa encontrada (similar) mas fkGenero é null. Atualizando...");
                                String generoDetectado = detectarGenero(nome);
                                Genero genero = obterOuCriarGenero(generoDetectado);
                                pessoaExistente.setFkGenero(genero);
                                pessoaExistente = pessoaRepository.save(pessoaExistente);
                                System.out.println("✅ Gênero atualizado para: " + genero.getNome());
                            } else {
                                System.out.println("✅ Gênero atual: " + pessoaExistente.getFkGenero().getNome());
                            }
                            break;
                        }
                    }
                }
            }
            
            if (pessoaExistente != null) {
                System.out.println("✅ Pessoa encontrada: " + pessoaExistente.getNome() + 
                                 " (ID: " + pessoaExistente.getPkPessoa() + ")");
                
                boolean atualizou = false;
                
                // Atualizar nome se for diferente
                if (!pessoaExistente.getNome().equalsIgnoreCase(nome)) {
                    System.out.println("🔄 Atualizando nome da pessoa de '" + 
                                     pessoaExistente.getNome() + "' para '" + nome + "'");
                    pessoaExistente.setNome(nome);
                    atualizou = true;
                }
                
                // ✅ Atualizar gênero baseado no novo nome
                String generoDetectado = detectarGenero(nome);
                String generoAtual = pessoaExistente.getFkGenero() != null ? 
                                     pessoaExistente.getFkGenero().getNome() : "Não informado";
                
                if (!generoDetectado.equalsIgnoreCase(generoAtual)) {
                    System.out.println("🔄 Atualizando gênero de '" + 
                                     generoAtual + "' para '" + generoDetectado + "'");
                    Genero genero = obterOuCriarGenero(generoDetectado);
                    pessoaExistente.setFkGenero(genero);
                    atualizou = true;
                }
                
                if (atualizou) {
                    pessoaExistente = pessoaRepository.save(pessoaExistente);
                    System.out.println("✅ Pessoa atualizada com sucesso");
                }
                
                return pessoaExistente;
            }
        } catch (Exception e) {
            System.out.println("⚠️ Erro ao buscar pessoa existente: " + e.getMessage());
            // Continuar para criar nova pessoa
        }
        
        // Se não encontrou, criar nova pessoa
        System.out.println("📍 Criando nova pessoa para: " + nome);
        Pessoa novaPessoa = new Pessoa();
        novaPessoa.setNome(nome);
        
        // ✅ DETECTAR E DEFINIR GÊNERO AUTOMATICAMENTE
        String generoDetectado = detectarGenero(nome);
        Genero genero = obterOuCriarGenero(generoDetectado);
        novaPessoa.setFkGenero(genero);
        System.out.println("✅ Gênero detectado: " + genero.getNome());
        
        // Definir identificação com base no nome e data (apenas para não deixar null)
        String identificacao = "DEN-" + nome.replaceAll("\\s+", "-").toUpperCase() + 
                              "-" + System.currentTimeMillis();
        novaPessoa.setIdentificacao(identificacao);
        
        // Definir data de nascimento padrão (25 anos atrás)
        novaPessoa.setDataNascimento(LocalDate.now().minusYears(25));
        
        // Definir localidade padrão
        novaPessoa.setLocalidade(obterOuCriarLocalidadePadrao());
        
        // ✅ CORREÇÃO: Inicializar a lista de telefones para evitar NullPointerException
        novaPessoa.setTelefones(new ArrayList<>());
        
        try {
            Pessoa pessoaSalva = pessoaRepository.save(novaPessoa);
            System.out.println("✅ Nova pessoa criada: " + pessoaSalva.getNome() + 
                             " (ID: " + pessoaSalva.getPkPessoa() + ")");
            System.out.println("✅ Gênero salvo: " + 
                              (pessoaSalva.getFkGenero() != null ? 
                               pessoaSalva.getFkGenero().getNome() : "null"));
            return pessoaSalva;
        } catch (Exception e) {
            System.err.println("❌ Erro ao criar nova pessoa: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
