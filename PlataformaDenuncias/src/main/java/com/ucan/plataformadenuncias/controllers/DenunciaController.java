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

    @Autowired private DenunciaService denunciaService;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private LocalidadeRepository localidadeRepository;
    @Autowired private PessoaRepository pessoaRepository;
    @Autowired private GeneroRepository generoRepository;

    @GetMapping("/home")
    public Map<String, String> home() {
        return Map.of("mensagem", "Seja bem-vindo à Plataforma Nacional de Denúncias 🇦🇴");
    }
    
    @GetMapping("/{codigo}")
      @Transactional(readOnly = true) 
    public ResponseEntity<?> buscar(@PathVariable String codigo) {
         Denuncia denunciaBuscada= denunciaService.buscarPorCodigo(codigo);
        DenunciaResponseDTO responseDTO = converterParaDTO(denunciaBuscada);
            return ResponseEntity.ok(responseDTO);
        
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DenunciaResponseDTO>> listar() {
        return ResponseEntity.ok(denunciaService.listarTodas().stream()
            .map(this::converterParaDTO).collect(Collectors.toList()));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrar(@RequestBody DenunciaRequestDTO dto) {
        try {
            Denuncia denuncia = new Denuncia();
            denuncia.setDescricaoDetalhada(dto.getDescricaoDetalhada());
            denuncia.setTipoEspecifico(dto.getTipoEspecifico());
            denuncia.setSubtipo(dto.getSubtipo());
            denuncia.setAnexo(dto.getAnexo());
            denuncia.setLocalEspecificoDaOcorrencia(dto.getLocalEspecificoDaOcorrencia());
            denuncia.setAnonima(dto.isAnonima());
            denuncia.setDataRegistro(LocalDateTime.now());
            denuncia.setDataOcorrecia(dto.getDataOcorrecia() != null ? dto.getDataOcorrecia() : LocalDate.now());

            // Pessoa e contactos (só se não for anônimo)
            if (!dto.isAnonima()) {
                denuncia.setContacto(dto.getContacto());
                denuncia.setEmail(dto.getEmail() != null && !dto.getEmail().trim().isEmpty() ? dto.getEmail().trim() : null);
                Pessoa pessoa = buscarOuCriarPessoa(dto.getNome());
                if (pessoa != null) denuncia.setPessoa(pessoa);
            }

            // Categoria
            Categoria categoria = categoriaRepository.findByNome(dto.getCategoriaNome()).orElse(null);
            if (categoria == null) {
                categoria = new Categoria();
                categoria.setNome(dto.getCategoriaNome());
                categoria.setLocalidade(obterLocalidadePadrao());
                categoria = categoriaRepository.save(categoria);
            }
            denuncia.setCategoria(categoria);

            // Localidade
            denuncia.setLocalidade(obterOuCriarLocalidade(dto.getMunicipio(), dto.getBairro(), dto.getNomeRua()));

            Denuncia salva = denunciaService.salvar(denuncia);
            return ResponseEntity.ok(converterParaDTO(salva));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body("Arquivo vazio");
            
            String[] tiposPermitidos = {"image/jpeg", "image/jpg", "image/png", "application/pdf"};
            String contentType = file.getContentType();
            if (contentType == null || !Arrays.asList(tiposPermitidos).contains(contentType)) {
                return ResponseEntity.badRequest().body("Tipo de arquivo não permitido");
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Arquivo muito grande (máximo 5MB)");
            }

            String uploadDirPath = System.getProperty("java.io.tmpdir") + File.separator + "uploads_denuncias";
            File uploadDir = new File(uploadDirPath);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) ext = original.substring(original.lastIndexOf("."));
            
            String filename = "upload_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            File dest = new File(uploadDir, filename);
            file.transferTo(dest);
            
            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erro ao salvar arquivo");
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================
    
    private DenunciaResponseDTO converterParaDTO(Denuncia d) {
        System.out.println("den "+ d.getCodigo());
        DenunciaResponseDTO dto = new DenunciaResponseDTO();
        dto.setPkDenuncia(d.getPkDenuncia());
        dto.setCodigo(d.getCodigo());
        dto.setNome(d.getPessoa() != null ? d.getPessoa().getNome() : null);
        dto.setContacto(d.getContacto());
        dto.setEmail(d.getEmail());
        dto.setDescricaoDetalhada(d.getDescricaoDetalhada());
        dto.setSubtipo(d.getSubtipo());
        dto.setAnexo(d.getAnexo());
        dto.setLocalEspecificoDaOcorrencia(d.getLocalEspecificoDaOcorrencia());
        dto.setAnonima(d.isAnonima());
        dto.setDataOcorrecia(d.getDataOcorrecia());
        dto.setDataRegistro(d.getDataRegistro());
        dto.setCategoriaNome(d.getCategoria() != null ? d.getCategoria().getNome() : null);
        
        if (d.getLocalidade() != null) {
            dto.setBairro(d.getLocalidade().getNome());
            dto.setNomeRua(d.getLocalidade().getNomeRua());
            dto.setMunicipio(d.getLocalidade().getLocalidadePai() != null ? 
                d.getLocalidade().getLocalidadePai().getNome() : d.getLocalidade().getNome());
        }
        return dto;
    }

    private Localidade obterLocalidadePadrao() {
        return localidadeRepository.findByNomeAndTipo("Luanda", TipoLocalidade.MUNICIPIO)
            .orElseGet(() -> localidadeRepository.save(criarLocalidade("Luanda", TipoLocalidade.MUNICIPIO, null)));
    }

    private Localidade criarLocalidade(String nome, TipoLocalidade tipo, Localidade pai) {
        Localidade l = new Localidade();
        l.setNome(nome);
        l.setTipo(tipo);
        l.setLocalidadePai(pai);
        return l;
    }

    private Localidade obterOuCriarLocalidade(String municipioNome, String bairroNome, String nomeRua) {
        Localidade municipio = localidadeRepository.findByNomeAndTipo(municipioNome, TipoLocalidade.MUNICIPIO)
            .orElseGet(() -> localidadeRepository.save(criarLocalidade(municipioNome, TipoLocalidade.MUNICIPIO, null)));
        
        Localidade bairro = municipio;
        if (bairroNome != null && !bairroNome.trim().isEmpty()) {
            bairro = localidadeRepository.findByNomeAndLocalidadePai(bairroNome, municipio)
                .orElseGet(() -> {
                    Localidade novo = criarLocalidade(bairroNome, TipoLocalidade.BAIRRO, municipio);
                    novo.setNomeRua(nomeRua);
                    return localidadeRepository.save(novo);
                });
        }
        return bairro;
    }

    private String detectarGenero(String nome) {
        if (nome == null || nome.trim().isEmpty()) return "Não informado";
        String primeiroNome = nome.trim().split(" ")[0].toLowerCase();
        
        // Remover acentos
        String norm = primeiroNome.replaceAll("[áàâãä]", "a").replaceAll("[éèêë]", "e")
            .replaceAll("[íìîï]", "i").replaceAll("[óòôõö]", "o").replaceAll("[úùûü]", "u");
        
        if (norm.matches(".*(a|e|i|ade|ina|ela)$")) return "Feminino";
        if (norm.matches(".*(o|u|ão|io|to)$")) return "Masculino";
        return "Não informado";
    }

    private Genero obterOuCriarGenero(String nome) {
        return generoRepository.findByNome(nome).orElseGet(() -> {
            Genero g = new Genero(); g.setNome(nome); return generoRepository.save(g);
        });
    }

    private Pessoa buscarOuCriarPessoa(String nome) {
        if (nome == null || nome.trim().isEmpty()) return null;
        nome = nome.trim();
        
        Optional<Pessoa> existente = pessoaRepository.findByNome(nome);
        if (existente.isPresent()) return existente.get();
        
        Pessoa nova = new Pessoa();
        nova.setNome(nome);
        nova.setFkGenero(obterOuCriarGenero(detectarGenero(nome)));
        nova.setDataNascimento(LocalDate.now().minusYears(25));
        nova.setLocalidade(obterLocalidadePadrao());
        nova.setTelefones(new ArrayList<>());
        return pessoaRepository.save(nova);
    }
}
