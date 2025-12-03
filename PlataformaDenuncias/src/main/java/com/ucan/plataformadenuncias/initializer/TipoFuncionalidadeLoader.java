package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.entities.TipoFuncionalidade;
import com.ucan.plataformadenuncias.entities.Versao;
import com.ucan.plataformadenuncias.repositories.FuncionalidadeRepository;
import com.ucan.plataformadenuncias.repositories.TipoFuncionalidadeRepository;
import com.ucan.plataformadenuncias.services.VersaoService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.function.Function;

public class TipoFuncionalidadeLoader {

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd-HH-mm");

    /**
     * Valida e insere tipos de funcionalidade com controle de versão PREVENTIVO
     * Não permite importar arquivos antigos NEM com datas futuras
     */
    @Transactional
    public static List<String> insertTipoFuncionalidadeIntoTable(
            MultipartFile file, TipoFuncionalidadeRepository tipoFuncionalidadeRepository, 
            VersaoService versaoService) {
        
        List<String> erros = new ArrayList<>();

        if (file.isEmpty()) {
            erros.add("❌ Ficheiro está vazio");
            return erros;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(1); // Segunda folha para tipos
            if (sheet == null) {
                erros.add("❌ Folha de tipos de funcionalidade não encontrada");
                return erros;
            }

            // 1. Extrair e validar cabeçalho
            System.out.println("=== VALIDANDO CABEÇALHO TIPOS ===");
            String nome = FuncionsHelper.getCellAsString(sheet.getRow(0).getCell(1));
            String descricao = FuncionsHelper.getCellAsString(sheet.getRow(1).getCell(1));
            String dataString = FuncionsHelper.getCellAsString(sheet.getRow(2).getCell(1));

            if (nome == null || nome.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 1, coluna B): Nome não pode estar vazio");
            }
            if (descricao == null || descricao.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 2, coluna B): Descrição não pode estar vazia");
            }
            if (dataString == null || dataString.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 3, coluna B): Data não pode estar vazia");
            }

            if (!erros.isEmpty()) {
                return erros;
            }

            // 2. Converter data do arquivo
            Date dataArquivo;
            try {
                dataArquivo = DATE_FORMAT.parse(dataString);
            } catch (ParseException e) {
                erros.add("❌ Cabeçalho (linha 3, coluna B): Formato de data inválido. Use: yyyy-MM-dd-HH-mm");
                return erros;
            }

            // 2.5. VERIFICAR SE A DATA É FUTURA
            Date dataAtual = new Date();
            if (dataArquivo.after(dataAtual)) {
                String dataAtualStr = DATE_FORMAT.format(dataAtual);
                String dataArquivoStr = DATE_FORMAT.format(dataArquivo);
                
                erros.add("❌ DATA FUTURA REJEITADA: O arquivo de tipos possui uma data do futuro.");
                erros.add("   📅 Data do arquivo: " + dataArquivoStr);
                erros.add("   📅 Data atual do sistema: " + dataAtualStr);
                erros.add("   ℹ️ A data do arquivo não pode ser posterior à data atual.");
                return erros;
            }

            // 3. Verificar versão - PREVENTIVO (NÃO processar se arquivo for antigo)
            int comparacao = versaoService.comparaDataVersao(Defs.TIPO_FUNCIONALIDADE, dataArquivo);
            
            if (comparacao < 0) {
                // Arquivo é mais antigo que a versão atual - REJEITAR
                Versao versaoAtual = versaoService.obterVersao(Defs.TIPO_FUNCIONALIDADE);
                if (versaoAtual != null) {
                    Date dataVersaoAtual = versaoAtual.getData();
                    String dataVersaoAtualStr = DATE_FORMAT.format(dataVersaoAtual);
                    String dataArquivoStr = DATE_FORMAT.format(dataArquivo);
                    
                    erros.add("❌ VERSÃO REJEITADA: O arquivo de tipos de funcionalidade é mais antigo que a versão atual.");
                    erros.add("   📅 Data do arquivo: " + dataArquivoStr);
                    erros.add("   📅 Última versão importada: " + dataVersaoAtualStr);
                    erros.add("   ℹ️ Para importar, use um arquivo com data igual ou posterior a: " + dataVersaoAtualStr);
                    return erros;
                }
            }

            System.out.println("✅ Versão válida - continuando com importação de tipos...");

            // 4. Encontrar início dos dados
            int startIndex = encontrarInicioDadosTipos(sheet);
            if (startIndex == -1) {
                erros.add("❌ Não foi possível encontrar o início dos dados na folha de tipos");
                return erros;
            }

            System.out.println("Iniciando leitura na linha: " + (startIndex + 1));

            // 5. Processar linhas
            int index = startIndex;
            int linhasProcessadas = 0;
            int linhasComErro = 0;
            Set<Integer> pksProcessados = new HashSet<>();

            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                if (row == null || isEmptyRow(row)) {
                    index++;
                    continue;
                }

                List<String> errosLinha = validarLinhaTipoFuncionalidade(row, index, pksProcessados);
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    linhasComErro++;
                    index++;
                    continue;
                }

                try {
                    TipoFuncionalidade tipoFuncionalidade = processarLinhaTipoFuncionalidade(row);
                    if (tipoFuncionalidade != null) {
                        tipoFuncionalidadeRepository.save(tipoFuncionalidade);
                        pksProcessados.add(tipoFuncionalidade.getPkTipoFuncionalidade());
                        linhasProcessadas++;
                    }
                } catch (Exception e) {
                    erros.add("❌ Linha " + (index + 1) + ": Erro ao processar - " + e.getMessage());
                    linhasComErro++;
                }
                
                index++;
            }

            System.out.println("=== FIM DA VALIDAÇÃO DE TIPOS ===");
            System.out.println("Linhas processadas com sucesso: " + linhasProcessadas);
            System.out.println("Linhas com erro: " + linhasComErro);

            // 6. Se houve sucesso, atualizar versão APENAS se for mais recente
            if (linhasProcessadas > 0 && erros.isEmpty()) {
                if (comparacao > 0) { // Apenas atualiza se for mais recente
                    versaoService.atualizarDataVersao(
                        Defs.TIPO_FUNCIONALIDADE, 
                        dataArquivo, 
                        "Importação de tipos de funcionalidade - " + new Date()
                    );
                    System.out.println("✅ Versão de tipos de funcionalidade atualizada para: " + dataString);
                }
            }

        } catch (Exception e) {
            erros.add("❌ Erro ao ler ficheiro: " + e.getMessage());
            e.printStackTrace();
        }

        return erros;
    }

    /**
     * Valida e insere funcionalidades com controle de versão PREVENTIVO
     * Não permite importar arquivos antigos NEM com datas futuras
     */
    @Transactional
    public static List<String> insertFuncionalidadeIntoTable(
            MultipartFile file, FuncionalidadeRepository funcionalidadeRepository, 
            VersaoService versaoService) {
        
        List<String> erros = new ArrayList<>();

        if (file.isEmpty()) {
            erros.add("❌ Ficheiro está vazio");
            return erros;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0); // Primeira folha

            // 1. Validar cabeçalho
            System.out.println("=== VALIDANDO CABEÇALHO FUNCIONALIDADES ===");
            String nome = FuncionsHelper.getCellAsString(sheet.getRow(0).getCell(1));
            String descricao = FuncionsHelper.getCellAsString(sheet.getRow(1).getCell(1));
            String dataString = FuncionsHelper.getCellAsString(sheet.getRow(2).getCell(1));

            if (nome == null || nome.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 1, coluna B): Nome não pode estar vazio");
            }
            if (descricao == null || descricao.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 2, coluna B): Descrição não pode estar vazia");
            }
            if (dataString == null || dataString.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 3, coluna B): Data não pode estar vazia");
            }

            if (!erros.isEmpty()) {
                return erros;
            }

            // 2. Converter data do arquivo
            Date dataArquivo;
            try {
                dataArquivo = DATE_FORMAT.parse(dataString);
            } catch (ParseException e) {
                erros.add("❌ Cabeçalho (linha 3, coluna B): Formato de data inválido. Use: yyyy-MM-dd-HH-mm");
                return erros;
            }

            // 2.5. VERIFICAR SE A DATA É FUTURA
            Date dataAtual = new Date();
            if (dataArquivo.after(dataAtual)) {
                String dataAtualStr = DATE_FORMAT.format(dataAtual);
                String dataArquivoStr = DATE_FORMAT.format(dataArquivo);
                
                erros.add("❌ DATA FUTURA REJEITADA: O arquivo de funcionalidades possui uma data do futuro.");
                erros.add("   📅 Data do arquivo: " + dataArquivoStr);
                erros.add("   📅 Data atual do sistema: " + dataAtualStr);
                erros.add("   ℹ️ A data do arquivo não pode ser posterior à data atual.");
                return erros;
            }

            // 3. Verificar versão - PREVENTIVO (NÃO processar se arquivo for antigo)
            int comparacao = versaoService.comparaDataVersao(Defs.FUNCIONALIDADE, dataArquivo);
            
            if (comparacao < 0) {
                // Arquivo é mais antigo que a versão atual - REJEITAR
                Versao versaoAtual = versaoService.obterVersao(Defs.FUNCIONALIDADE);
                if (versaoAtual != null) {
                    Date dataVersaoAtual = versaoAtual.getData();
                    String dataVersaoAtualStr = DATE_FORMAT.format(dataVersaoAtual);
                    String dataArquivoStr = DATE_FORMAT.format(dataArquivo);
                    
                    erros.add("❌ VERSÃO REJEITADA: O arquivo de funcionalidades é mais antigo que a versão atual.");
                    erros.add("   📅 Data do arquivo: " + dataArquivoStr);
                    erros.add("   📅 Última versão importada: " + dataVersaoAtualStr);
                    erros.add("   ℹ️ Para importar, use um arquivo com data igual ou posterior a: " + dataVersaoAtualStr);
                    return erros;
                }
            }

            System.out.println("✅ Versão válida - continuando com importação de funcionalidades...");

            // 4. Encontrar início dos dados das funcionalidades
            int startIndex = encontrarInicioDadosFuncionalidades(sheet);
            if (startIndex == -1) {
                erros.add("❌ Não foi possível encontrar o início dos dados na folha de funcionalidades");
                return erros;
            }

            System.out.println("Iniciando leitura de funcionalidades na linha: " + (startIndex + 1));

            // 5. Processar linhas - FASE 1: Coletar todos os dados
            System.out.println("=== INÍCIO VALIDAÇÃO FUNCIONALIDADES ===");
            int index = startIndex;
            int linhasValidadas = 0;
            int linhasComErro = 0;
            Set<Integer> pksValidadas = new HashSet<>();
            
            // Lista para armazenar os dados brutos das funcionalidades
            List<FuncionalidadeData> funcionalidadesData = new ArrayList<>();
            // Mapa para armazenar referências cruzadas
            Map<Integer, FuncionalidadeData> funcionalidadesPorPk = new HashMap<>();

            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                if (row == null) {
                    index++;
                    continue;
                }
                
                // Parar quando encontrar linha vazia
                if (isEmptyRow(row)) {
                    break;
                }

                List<String> errosLinha = validarLinhaFuncionalidade(row, index, pksValidadas);
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    linhasComErro++;
                    index++;
                    continue;
                }

                try {
                    FuncionalidadeData funcData = processarLinhaFuncionalidadeData(row);
                    if (funcData != null) {
                        funcionalidadesData.add(funcData);
                        if (funcData.pkFuncionalidade > 0) {
                            funcionalidadesPorPk.put(funcData.pkFuncionalidade, funcData);
                        }
                        pksValidadas.add(funcData.pkFuncionalidade);
                        linhasValidadas++;
                    }
                } catch (Exception e) {
                    erros.add("❌ Linha " + (index + 1) + ": Erro ao processar - " + e.getMessage());
                    linhasComErro++;
                }
                
                index++;
            }

            System.out.println("=== FIM DA VALIDAÇÃO ===");
            System.out.println("Linhas validadas: " + linhasValidadas);
            System.out.println("Linhas com erro: " + linhasComErro);

            // 6. Se houver erros de validação, parar aqui
            if (!erros.isEmpty()) {
                return erros;
            }

            // 7. Ordenar funcionalidades para resolver dependências
            List<FuncionalidadeData> funcionalidadesOrdenadas = ordenarPorDependencia(funcionalidadesData);

            // 8. Processar funcionalidades em ordem
            System.out.println("=== INÍCIO INSERÇÃO FUNCIONALIDADES ===");
            int linhasProcessadas = 0;
            int linhasInseridas = 0;
            int linhasAtualizadas = 0;
            
            // Mapa para cache de funcionalidades já salvas/recuperadas
            Map<Integer, Funcionalidade> cacheFuncionalidades = new HashMap<>();
            
            for (FuncionalidadeData funcData : funcionalidadesOrdenadas) {
                try {
                    // Verificar se já existe no banco
                    Optional<Funcionalidade> existenteOpt = funcData.pkFuncionalidade > 0 ? 
                        funcionalidadeRepository.findById(funcData.pkFuncionalidade) : Optional.empty();
                    
                    Funcionalidade funcionalidade;
                    boolean isNova = false;
                    
                    if (existenteOpt.isPresent()) {
                        // Atualizar existente
                        funcionalidade = existenteOpt.get();
                        atualizarFuncionalidadeExistente(funcionalidade, funcData);
                        System.out.println("📝 Atualizada funcionalidade ID: " + funcionalidade.getPkFuncionalidade());
                        linhasAtualizadas++;
                    } else {
                        // Criar nova
                        funcionalidade = criarFuncionalidadeDeData(funcData);
                        isNova = true;
                        System.out.println("➕ Criada nova funcionalidade ID: " + funcionalidade.getPkFuncionalidade());
                    }
                    
                    // Resolver referência à funcionalidade pai (fkFuncionalidade)
                    if (funcData.fkFuncionalidade != null && funcData.fkFuncionalidade > 0) {
                        // Buscar no cache primeiro
                        Funcionalidade funcPai = cacheFuncionalidades.get(funcData.fkFuncionalidade);
                        
                        if (funcPai == null) {
                            // Buscar no banco
                            Optional<Funcionalidade> paiOpt = funcionalidadeRepository.findById(funcData.fkFuncionalidade);
                            if (paiOpt.isPresent()) {
                                funcPai = paiOpt.get();
                                cacheFuncionalidades.put(funcPai.getPkFuncionalidade(), funcPai);
                            } else {
                                // Verificar se está na lista de funcionalidades que serão processadas
                                FuncionalidadeData paiData = funcionalidadesPorPk.get(funcData.fkFuncionalidade);
                                if (paiData != null) {
                                    // Pai será processado depois ou já foi processado? Vamos verificar
                                    // Como estamos ordenados, o pai deve vir antes
                                    // Se chegou aqui, é um problema na ordenação - vamos ignorar a referência
                                    System.out.println("⚠️ Funcionalidade pai ID " + funcData.fkFuncionalidade + 
                                                     " não encontrada no cache. Pode ser problema de ordenação.");
                                } else {
                                    // Pai não existe e não está na lista
                                    System.out.println("⚠️ Funcionalidade pai ID " + funcData.fkFuncionalidade + 
                                                     " não encontrada. Definindo como null.");
                                }
                                funcionalidade.setFkFuncionalidade(null);
                            }
                        }
                        
                        if (funcPai != null) {
                            funcionalidade.setFkFuncionalidade(funcPai);
                        }
                    }
                    
                    // Salvar a funcionalidade
                    Funcionalidade funcSalva = funcionalidadeRepository.save(funcionalidade);
                    
                    // Adicionar ao cache
                    if (funcSalva.getPkFuncionalidade() != null) {
                        cacheFuncionalidades.put(funcSalva.getPkFuncionalidade(), funcSalva);
                    }
                    
                    if (isNova) {
                        linhasInseridas++;
                    }
                    linhasProcessadas++;
                    
                } catch (Exception e) {
                    erros.add("❌ Erro ao processar funcionalidade ID " + funcData.pkFuncionalidade + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }

            System.out.println("=== FIM DA INSERÇÃO ===");
            System.out.println("Linhas processadas: " + linhasProcessadas);
            System.out.println("Linhas inseridas: " + linhasInseridas);
            System.out.println("Linhas atualizadas: " + linhasAtualizadas);

            // 9. Se houve sucesso, atualizar versão APENAS se for mais recente
            if (linhasProcessadas > 0 && erros.isEmpty()) {
                if (comparacao > 0) { // Apenas atualiza se for mais recente
                    versaoService.atualizarDataVersao(
                        Defs.FUNCIONALIDADE, 
                        dataArquivo, 
                        "Importação de funcionalidades - " + new Date()
                    );
                    System.out.println("✅ Versão de funcionalidades atualizada para: " + dataString);
                }
            }

        } catch (Exception e) {
            erros.add("❌ Erro ao ler ficheiro: " + e.getMessage());
            e.printStackTrace();
        }

        return erros;
    }

    /**
     * Encontra o início dos dados das funcionalidades baseado no cabeçalho
     */
    private static int encontrarInicioDadosFuncionalidades(Sheet sheet) {
        // Procura pelo cabeçalho "pk_funcionalidade" na primeira coluna
        for (int i = 0; i <= Math.min(20, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell = row.getCell(0);
                if (cell != null) {
                    String valor = FuncionsHelper.getCellAsString(cell);
                    if (valor != null && "pk_funcionalidade".equalsIgnoreCase(valor.trim())) {
                        return i + 1; // Dados começam na próxima linha
                    }
                }
            }
        }
        
        // Fallback: procura por padrão numérico na primeira coluna a partir da linha 4
        for (int i = 4; i <= Math.min(20, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell = row.getCell(0);
                if (cell != null) {
                    String valor = FuncionsHelper.getCellAsString(cell);
                    if (valor != null && !valor.trim().isEmpty()) {
                        try {
                            int num = Integer.parseInt(valor.trim());
                            if (num >= 0) { // Aceita 0 para novos registros
                                return i;
                            }
                        } catch (NumberFormatException e) {
                            // Não é número, continua procurando
                        }
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Classe auxiliar para armazenar dados da funcionalidade sem referências Hibernate
     */
    private static class FuncionalidadeData {
        Integer pkFuncionalidade;
        String designacao;
        String descricao;
        Integer fkTipoFuncionalidade;
        Integer grupo;
        Integer fkFuncionalidade; // ID da funcionalidade pai
        String funcionalidadesPartilhadas;
        String url;
        
        FuncionalidadeData(Integer pkFuncionalidade, String designacao, String descricao, 
                          Integer fkTipoFuncionalidade, Integer grupo, Integer fkFuncionalidade,
                          String funcionalidadesPartilhadas, String url) {
            this.pkFuncionalidade = pkFuncionalidade;
            this.designacao = designacao;
            this.descricao = descricao;
            this.fkTipoFuncionalidade = fkTipoFuncionalidade;
            this.grupo = grupo;
            this.fkFuncionalidade = fkFuncionalidade;
            this.funcionalidadesPartilhadas = funcionalidadesPartilhadas;
            this.url = url;
        }
    }

    /**
     * Processa uma linha de funcionalidade para dados brutos
     */
    private static FuncionalidadeData processarLinhaFuncionalidadeData(Row row) {
        try {
            // Função auxiliar para obter valores inteiros com validação rigorosa
            Function<Cell, Integer> getIntValue = (cell) -> {
                if (cell == null) return 0;
                
                // Primeiro obtém como string para validação completa
                String cellValue = FuncionsHelper.getCellAsString(cell);
                if (cellValue == null || cellValue.trim().isEmpty()) return 0;
                
                cellValue = cellValue.trim();
                
                // VALIDAÇÃO RIGOROSA: verifica se é um número inteiro válido
                try {
                    // Tenta converter diretamente para inteiro
                    return Integer.parseInt(cellValue);
                } catch (NumberFormatException e1) {
                    // Se falhar, tenta como double e verifica se não tem parte decimal
                    try {
                        double doubleValue = Double.parseDouble(cellValue);
                        // Verifica se é um número inteiro (sem parte decimal)
                        if (doubleValue != Math.floor(doubleValue)) {
                            throw new RuntimeException("Valor deve ser inteiro, sem casas decimais: '" + cellValue + "'");
                        }
                        return (int) doubleValue;
                    } catch (NumberFormatException e2) {
                        throw new RuntimeException("Valor deve ser um número inteiro: '" + cellValue + "'");
                    }
                }
            };

            // Função auxiliar para obter valores de string
            Function<Cell, String> getStringValue = (cell) -> {
                if (cell == null) return "";
                return FuncionsHelper.getCellAsString(cell);
            };

            // pkFuncionalidade - VALIDAÇÃO RIGOROSA
            Integer pkFuncionalidade = null;
            Cell cell0 = row.getCell(0);
            if (cell0 != null) {
                String valorPkStr = getStringValue.apply(cell0);
                if (valorPkStr != null && !valorPkStr.trim().isEmpty()) {
                    valorPkStr = valorPkStr.trim();
                    
                    // Verifica se é um número inteiro válido
                    if (!valorPkStr.matches("\\d+")) {
                        // Se não for apenas dígitos, verifica se é um número decimal
                        if (valorPkStr.matches("\\d+\\.\\d+")) {
                            // É um número decimal - verifica se é inteiro
                            double doubleValue = Double.parseDouble(valorPkStr);
                            if (doubleValue != Math.floor(doubleValue)) {
                                throw new RuntimeException("Coluna A: PK Funcionalidade deve ser inteiro (sem casas decimais). Valor: '" + valorPkStr + "'");
                            }
                            pkFuncionalidade = (int) doubleValue;
                        } else {
                            // É um caractere/texto - ERRO
                            throw new RuntimeException("Coluna A: PK Funcionalidade deve ser um número inteiro. Valor inválido: '" + valorPkStr + "'");
                        }
                    } else {
                        // É um número inteiro válido
                        pkFuncionalidade = Integer.parseInt(valorPkStr);
                    }
                    
                    if (pkFuncionalidade < 0) {
                        throw new RuntimeException("Coluna A: PK Funcionalidade não pode ser negativo");
                    }
                } else {
                    throw new RuntimeException("Coluna A: PK Funcionalidade não pode estar vazio");
                }
            } else {
                throw new RuntimeException("Coluna A: PK Funcionalidade é obrigatório");
            }
            
            // designacao
            String designacao = getStringValue.apply(row.getCell(1));
            if (designacao == null || designacao.trim().isEmpty()) {
                throw new RuntimeException("Coluna B: Designação não pode estar vazia");
            }
            
            // descricao
            String descricao = getStringValue.apply(row.getCell(2));
            if (descricao == null || descricao.trim().isEmpty()) {
                throw new RuntimeException("Coluna C: Descrição não pode estar vazia");
            }
            
            // fkTipoFuncionalidade
            Integer fkTipo = getIntValue.apply(row.getCell(3));
            if (fkTipo <= 0) {
                throw new RuntimeException("Coluna D: FK Tipo Funcionalidade deve ser maior que 0");
            }
            
            // grupo
            Integer grupo = getIntValue.apply(row.getCell(4));
            
            // fkFuncionalidade (opcional)
            Integer fkFuncionalidade = null;
            Cell cell5 = row.getCell(5);
            if (cell5 != null && !isCellEmpty(cell5)) {
                String fkFuncStr = getStringValue.apply(cell5);
                if (fkFuncStr != null && !fkFuncStr.trim().isEmpty()) {
                    fkFuncStr = fkFuncStr.trim();
                    if (!fkFuncStr.matches("\\d+")) {
                        // Não é um número válido
                        if (fkFuncStr.equals("0")) {
                            fkFuncionalidade = 0;
                        } else {
                            throw new RuntimeException("Coluna F: FK Funcionalidade deve ser um número inteiro. Valor: '" + fkFuncStr + "'");
                        }
                    } else {
                        fkFuncionalidade = Integer.parseInt(fkFuncStr);
                        if (fkFuncionalidade == 0) {
                            fkFuncionalidade = null; // Trata 0 como null
                        }
                    }
                }
            }

            // funcionalidadesPartilhadas (opcional)
            String funcionalidadesPartilhadas = null;
            Cell cell6 = row.getCell(6);
            if (cell6 != null && !isCellEmpty(cell6)) {
                String partilhadas = getStringValue.apply(cell6);
                if (partilhadas != null && !partilhadas.trim().isEmpty()) {
                    funcionalidadesPartilhadas = partilhadas.trim();
                }
            }

            // url (opcional)
            String url = null;
            Cell cell7 = row.getCell(7);
            if (cell7 != null && !isCellEmpty(cell7)) {
                String urlValue = getStringValue.apply(cell7);
                if (urlValue != null && !urlValue.trim().isEmpty()) {
                    url = urlValue.trim();
                }
            }

            return new FuncionalidadeData(
                pkFuncionalidade, designacao, descricao, fkTipo, grupo,
                fkFuncionalidade, funcionalidadesPartilhadas, url
            );

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar linha: " + e.getMessage(), e);
        }
    }

    /**
     * Cria uma entidade Funcionalidade a partir dos dados
     */
    private static Funcionalidade criarFuncionalidadeDeData(FuncionalidadeData data) {
        Funcionalidade funcionalidade = new Funcionalidade();
        
        if (data.pkFuncionalidade > 0) {
            funcionalidade.setPkFuncionalidade(data.pkFuncionalidade);
        }
        
        funcionalidade.setDesignacao(data.designacao);
        funcionalidade.setDescricao(data.descricao);
        
        // Criar apenas a referência básica ao tipo (sem carregar tudo)
        TipoFuncionalidade tipo = new TipoFuncionalidade();
        tipo.setPkTipoFuncionalidade(data.fkTipoFuncionalidade);
        funcionalidade.setFkTipoFuncionalidade(tipo);
        
        funcionalidade.setGrupo(data.grupo);
        
        // NOTA: fkFuncionalidade será definida depois, quando resolvermos as dependências
        
        if (data.funcionalidadesPartilhadas != null) {
            funcionalidade.setFuncionalidadesPartilhadas(data.funcionalidadesPartilhadas);
        }
        
        if (data.url != null) {
            funcionalidade.setUrl(data.url);
        }
        
        return funcionalidade;
    }

    /**
     * Atualiza uma funcionalidade existente com novos dados
     */
    private static void atualizarFuncionalidadeExistente(Funcionalidade existente, FuncionalidadeData novosDados) {
        existente.setDesignacao(novosDados.designacao);
        existente.setDescricao(novosDados.descricao);
        
        // Atualizar tipo
        TipoFuncionalidade tipo = new TipoFuncionalidade();
        tipo.setPkTipoFuncionalidade(novosDados.fkTipoFuncionalidade);
        existente.setFkTipoFuncionalidade(tipo);
        
        existente.setGrupo(novosDados.grupo);
        
        // NOTA: fkFuncionalidade será atualizada depois, quando resolvermos as dependências
        
        existente.setFuncionalidadesPartilhadas(novosDados.funcionalidadesPartilhadas);
        existente.setUrl(novosDados.url);
    }

    /**
     * Ordena funcionalidades por dependência
     */
    private static List<FuncionalidadeData> ordenarPorDependencia(List<FuncionalidadeData> funcionalidades) {
        // Criar mapa de dependências
        Map<Integer, List<Integer>> dependencias = new HashMap<>();
        Map<Integer, FuncionalidadeData> funcionalidadesMap = new HashMap<>();
        
        for (FuncionalidadeData func : funcionalidades) {
            funcionalidadesMap.put(func.pkFuncionalidade, func);
            
            if (func.fkFuncionalidade != null && func.fkFuncionalidade > 0) {
                dependencias.computeIfAbsent(func.pkFuncionalidade, k -> new ArrayList<>())
                           .add(func.fkFuncionalidade);
            }
        }
        
        // Ordenação topológica simples
        List<FuncionalidadeData> ordenadas = new ArrayList<>();
        Set<Integer> processados = new HashSet<>();
        
        // Primeiro, adicionar funcionalidades sem dependências
        for (FuncionalidadeData func : funcionalidades) {
            if (func.fkFuncionalidade == null || func.fkFuncionalidade <= 0 || 
                !funcionalidadesMap.containsKey(func.fkFuncionalidade)) {
                ordenadas.add(func);
                processados.add(func.pkFuncionalidade);
            }
        }
        
        // Depois, adicionar as que dependem de funcionalidades já processadas
        boolean mudou;
        do {
            mudou = false;
            for (FuncionalidadeData func : funcionalidades) {
                if (!processados.contains(func.pkFuncionalidade)) {
                    if (func.fkFuncionalidade == null || func.fkFuncionalidade <= 0) {
                        ordenadas.add(func);
                        processados.add(func.pkFuncionalidade);
                        mudou = true;
                    } else if (processados.contains(func.fkFuncionalidade)) {
                        ordenadas.add(func);
                        processados.add(func.pkFuncionalidade);
                        mudou = true;
                    }
                }
            }
        } while (mudou);
        
        // Adicionar as restantes (pode haver referências circulares)
        for (FuncionalidadeData func : funcionalidades) {
            if (!processados.contains(func.pkFuncionalidade)) {
                ordenadas.add(func);
                processados.add(func.pkFuncionalidade);
            }
        }
        
        return ordenadas;
    }

    /**
     * Encontra o início dos dados baseado no cabeçalho
     */
    private static int encontrarInicioDadosTipos(Sheet sheet) {
        for (int i = 0; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell = row.getCell(0);
                if (cell != null) {
                    String valor = FuncionsHelper.getCellAsString(cell).trim();
                    if ("pk_tipo_funcionalidade".equalsIgnoreCase(valor)) {
                        return i + 1; // Dados começam na próxima linha
                    }
                }
            }
        }
        // Fallback: procura por padrão numérico na primeira coluna
        for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell = row.getCell(0);
                if (cell != null) {
                    String valor = FuncionsHelper.getCellAsString(cell).trim();
                    try {
                        int num = Integer.parseInt(valor);
                        if (num >= 0) { // Aceita 0 para novos registros
                            return i;
                        }
                    } catch (NumberFormatException e) {
                        // Não é número, continua procurando
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Verifica se uma linha está vazia
     */
    private static boolean isEmptyRow(Row row) {
        if (row == null) return true;
        
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !isCellEmpty(cell)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Processa uma linha de tipo de funcionalidade
     */
    private static TipoFuncionalidade processarLinhaTipoFuncionalidade(Row row) {
        try {
            TipoFuncionalidade tipoFuncionalidade = new TipoFuncionalidade();
            
            // Coluna 0 - pk_tipo_funcionalidade (pode ser 0 para novos registros)
            Cell cell0 = row.getCell(0);
            if (cell0 != null) {
                int pkTipo = converterParaInteiro(cell0, "PK Tipo Funcionalidade");
                if (pkTipo >= 0) { // Aceita 0 ou maior
                    tipoFuncionalidade.setPkTipoFuncionalidade(pkTipo);
                } else {
                    throw new RuntimeException("PK Tipo Funcionalidade não pode ser negativo");
                }
            } else {
                throw new RuntimeException("PK Tipo Funcionalidade é obrigatório");
            }
            
            // Coluna 1 - designacao
            Cell cell1 = row.getCell(1);
            if (cell1 != null) {
                String designacao = FuncionsHelper.getCellAsString(cell1).trim();
                if (!designacao.isEmpty()) {
                    tipoFuncionalidade.setDesignacao(designacao);
                } else {
                    throw new RuntimeException("Designação não pode estar vazia");
                }
            } else {
                throw new RuntimeException("Designação é obrigatória");
            }
            
            return tipoFuncionalidade;
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar linha de tipo funcionalidade: " + e.getMessage(), e);
        }
    }

    /**
     * Converte uma célula para inteiro com tratamento robusto (incluindo fórmulas)
     */
    private static int converterParaInteiro(Cell cell, String nomeCampo) {
        if (cell == null) {
            throw new RuntimeException(nomeCampo + " não pode ser nulo");
        }
        
        try {
            // Obtém sempre como string primeiro (mais robusto)
            String stringValue = FuncionsHelper.getCellAsString(cell);
            if (stringValue == null || stringValue.trim().isEmpty()) {
                throw new RuntimeException(nomeCampo + " não pode estar vazio");
            }
            
            stringValue = stringValue.trim();
            
            // VALIDAÇÃO RIGOROSA: verifica se contém apenas dígitos
            if (!stringValue.matches("\\d+")) {
                // Se não for apenas dígitos, verifica se é um número decimal
                if (stringValue.matches("\\d+\\.\\d+")) {
                    // É um número decimal - verifica se é inteiro
                    double doubleValue = Double.parseDouble(stringValue);
                    if (doubleValue != Math.floor(doubleValue)) {
                        throw new RuntimeException(nomeCampo + " deve ser inteiro, sem casas decimais. Valor: '" + stringValue + "'");
                    }
                    return (int) doubleValue;
                } else {
                    // É um caractere/texto - ERRO
                    throw new RuntimeException(nomeCampo + " deve ser um número inteiro. Valor inválido: '" + stringValue + "'");
                }
            }
            
            // Se chegou aqui, é um número inteiro válido
            int valor = Integer.parseInt(stringValue);
            if (valor < 0) {
                throw new RuntimeException(nomeCampo + " não pode ser negativo");
            }
            return valor;
            
        } catch (Exception e) {
            throw new RuntimeException(nomeCampo + " - " + e.getMessage());
        }
    }

    /**
     * Valida linha de tipo de funcionalidade com verificação de duplicados
     */
    private static List<String> validarLinhaTipoFuncionalidade(Row row, int numeroLinha, Set<Integer> pksProcessados) {
        List<String> erros = new ArrayList<>();
        int linhaReal = numeroLinha + 1;

        // Validação da coluna 0 - pk_tipo_funcionalidade
        Cell cell0 = row.getCell(0);
        if (cell0 == null) {
            erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Campo obrigatório não preenchido");
        } else {
            try {
                String valorCell0 = FuncionsHelper.getCellAsString(cell0);
                if (valorCell0 == null || valorCell0.trim().isEmpty()) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Não pode estar vazio");
                } else if ("pk_tipo_funcionalidade".equalsIgnoreCase(valorCell0.trim()) || 
                           "designacao".equalsIgnoreCase(valorCell0.trim())) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Texto de cabeçalho não permitido");
                } else {
                    // VALIDAÇÃO RIGOROSA PARA NÚMEROS INTEIROS
                    valorCell0 = valorCell0.trim();
                    
                    if (!valorCell0.matches("\\d+")) {
                        // Se não for apenas dígitos
                        if (valorCell0.matches("\\d+\\.\\d+")) {
                            // É um número decimal
                            double doubleValue = Double.parseDouble(valorCell0);
                            if (doubleValue != Math.floor(doubleValue)) {
                                erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Deve ser inteiro (sem casas decimais). Valor: '" + valorCell0 + "'");
                            } else {
                                int pkTipo = (int) doubleValue;
                                if (pkTipo < 0) {
                                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Não pode ser negativo");
                                } else if (pkTipo > 0 && pksProcessados.contains(pkTipo)) {
                                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): PK " + pkTipo + " duplicado neste arquivo");
                                }
                            }
                        } else {
                            // É um caractere/texto - ERRO
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Deve ser um número inteiro. Valor inválido: '" + valorCell0 + "'");
                        }
                    } else {
                        // É um número inteiro válido
                        int pkTipo = Integer.parseInt(valorCell0);
                        if (pkTipo < 0) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Não pode ser negativo");
                        } else if (pkTipo > 0 && pksProcessados.contains(pkTipo)) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): PK " + pkTipo + " duplicado neste arquivo");
                        }
                    }
                }
            } catch (Exception e) {
                erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): " + e.getMessage());
            }
        }

        // Validação da coluna 1 - designacao
        Cell cell1 = row.getCell(1);
        if (cell1 == null) {
            erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Campo obrigatório não preenchido");
        } else {
            try {
                String designacao = FuncionsHelper.getCellAsString(cell1);
                if (designacao == null || designacao.trim().isEmpty()) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Não pode estar vazia");
                } else if ("designacao".equalsIgnoreCase(designacao.trim())) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Texto de cabeçalho não permitido");
                }
            } catch (Exception e) {
                erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Erro ao ler - " + e.getMessage());
            }
        }

        return erros;
    }

    /**
     * Valida linha de funcionalidade com verificação de duplicados
     */
    private static List<String> validarLinhaFuncionalidade(Row row, int numeroLinha, Set<Integer> pksProcessados) {
        List<String> erros = new ArrayList<>();
        int linhaReal = numeroLinha + 1;

        // Função auxiliar para validar células como inteiros
        Function<Cell, String> getStringValue = (cell) -> {
            if (cell == null) return "";
            return FuncionsHelper.getCellAsString(cell);
        };

        // Coluna 0 - pkFuncionalidade (obrigatório, deve ser inteiro)
        Cell cell0 = row.getCell(0);
        if (cell0 == null) {
            erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Campo obrigatório não preenchido");
        } else {
            String valorStr = getStringValue.apply(cell0);
            if (valorStr == null || valorStr.trim().isEmpty()) {
                erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Não pode estar vazio");
            } else {
                valorStr = valorStr.trim();
                
                // VALIDAÇÃO RIGOROSA: verifica se é um número inteiro válido
                if (!valorStr.matches("\\d+")) {
                    // Se não for apenas dígitos, verifica se é um número decimal
                    if (valorStr.matches("\\d+\\.\\d+")) {
                        // É um número decimal - verifica se é inteiro
                        try {
                            double doubleValue = Double.parseDouble(valorStr);
                            if (doubleValue != Math.floor(doubleValue)) {
                                erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser inteiro (sem casas decimais). Valor: '" + valorStr + "'");
                            } else {
                                int pkValor = (int) doubleValue;
                                if (pkValor < 0) {
                                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Não pode ser negativo. Valor: " + pkValor);
                                } else if (pkValor > 0 && pksProcessados.contains(pkValor)) {
                                    erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): PK " + pkValor + " duplicado neste arquivo");
                                }
                            }
                        } catch (NumberFormatException e) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser um número válido. Valor inválido: '" + valorStr + "'");
                        }
                    } else {
                        // É um caractere/texto (ex: "a", "abc", etc.) - ERRO ESPECÍFICO
                        erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser um NÚMERO INTEIRO. Valor inválido: '" + valorStr + "'");
                    }
                } else {
                    // É um número inteiro válido
                    try {
                        int pkValor = Integer.parseInt(valorStr);
                        if (pkValor < 0) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Não pode ser negativo. Valor: " + pkValor);
                        } else if (pkValor > 0 && pksProcessados.contains(pkValor)) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): PK " + pkValor + " duplicado neste arquivo");
                        }
                    } catch (NumberFormatException e) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Erro ao converter para número: '" + valorStr + "'");
                    }
                }
            }
        }

        // Coluna 1 - designacao (obrigatório, string)
        Cell cell1 = row.getCell(1);
        if (cell1 == null) {
            erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Campo obrigatório não preenchido");
        } else {
            String designacao = FuncionsHelper.getCellAsString(cell1);
            if (designacao == null || designacao.trim().isEmpty()) {
                erros.add("❌ Linha " + linhaReal + ", Coluna B (designacao): Não pode estar vazia");
            }
        }

        // Coluna 2 - descricao (obrigatório, string)
        Cell cell2 = row.getCell(2);
        if (cell2 == null) {
            erros.add("❌ Linha " + linhaReal + ", Coluna C (descricao): Campo obrigatório não preenchido");
        } else {
            String descricao = FuncionsHelper.getCellAsString(cell2);
            if (descricao == null || descricao.trim().isEmpty()) {
                erros.add("❌ Linha " + linhaReal + ", Coluna C (descricao): Não pode estar vazia");
            }
        }

        // Coluna 3 - fkTipoFuncionalidade (obrigatório, inteiro)
        Cell cell3 = row.getCell(3);
        String valorFkTipoStr = getStringValue.apply(cell3);
        if (valorFkTipoStr == null || valorFkTipoStr.trim().isEmpty()) {
            erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Campo obrigatório não preenchido");
        } else {
            valorFkTipoStr = valorFkTipoStr.trim();
            // VALIDAÇÃO RIGOROSA: verifica se é um número inteiro válido
            if (!valorFkTipoStr.matches("\\d+")) {
                if (valorFkTipoStr.matches("\\d+\\.\\d+")) {
                    try {
                        double doubleValue = Double.parseDouble(valorFkTipoStr);
                        if (doubleValue != Math.floor(doubleValue)) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser inteiro (sem casas decimais). Valor: '" + valorFkTipoStr + "'");
                        } else {
                            int fkTipo = (int) doubleValue;
                            if (fkTipo <= 0) {
                                erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser maior que 0");
                            }
                        }
                    } catch (NumberFormatException e) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser um número válido. Valor: '" + valorFkTipoStr + "'");
                    }
                } else {
                    erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser um NÚMERO INTEIRO. Valor inválido: '" + valorFkTipoStr + "'");
                }
            } else {
                try {
                    int fkTipo = Integer.parseInt(valorFkTipoStr);
                    if (fkTipo <= 0) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser maior que 0");
                    }
                } catch (NumberFormatException e) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Erro ao converter para número: '" + valorFkTipoStr + "'");
                }
            }
        }

        // Coluna 4 - grupo (obrigatório, inteiro)
        Cell cell4 = row.getCell(4);
        String valorGrupoStr = getStringValue.apply(cell4);
        if (valorGrupoStr == null || valorGrupoStr.trim().isEmpty()) {
            erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Campo obrigatório não preenchido");
        } else {
            valorGrupoStr = valorGrupoStr.trim();
            // VALIDAÇÃO RIGOROSA: verifica se é um número inteiro válido
            if (!valorGrupoStr.matches("\\d+")) {
                if (valorGrupoStr.matches("\\d+\\.\\d+")) {
                    try {
                        double doubleValue = Double.parseDouble(valorGrupoStr);
                        if (doubleValue != Math.floor(doubleValue)) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser inteiro (sem casas decimais). Valor: '" + valorGrupoStr + "'");
                        } else {
                            int grupo = (int) doubleValue;
                            if (grupo < 0) {
                                erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser não negativo");
                            }
                        }
                    } catch (NumberFormatException e) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser um número válido. Valor: '" + valorGrupoStr + "'");
                    }
                } else {
                    erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser um NÚMERO INTEIRO. Valor inválido: '" + valorGrupoStr + "'");
                }
            } else {
                try {
                    int grupo = Integer.parseInt(valorGrupoStr);
                    if (grupo < 0) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser não negativo");
                    }
                } catch (NumberFormatException e) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Erro ao converter para número: '" + valorGrupoStr + "'");
                }
            }
        }

        // Coluna 5 - fkFuncionalidade (opcional, inteiro)
        Cell cell5 = row.getCell(5);
        if (cell5 != null && !isCellEmpty(cell5)) {
            String valorFkFuncStr = getStringValue.apply(cell5);
            if (valorFkFuncStr != null && !valorFkFuncStr.trim().isEmpty()) {
                valorFkFuncStr = valorFkFuncStr.trim();
                // VALIDAÇÃO RIGOROSA: verifica se é um número inteiro válido
                if (!valorFkFuncStr.matches("\\d+")) {
                    if (valorFkFuncStr.matches("\\d+\\.\\d+")) {
                        try {
                            double doubleValue = Double.parseDouble(valorFkFuncStr);
                            if (doubleValue != Math.floor(doubleValue)) {
                                erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser inteiro (sem casas decimais). Valor: '" + valorFkFuncStr + "'");
                            } else {
                                int fkFunc = (int) doubleValue;
                                if (fkFunc < 0) {
                                    erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser não negativo");
                                }
                            }
                        } catch (NumberFormatException e) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser um número válido. Valor: '" + valorFkFuncStr + "'");
                        }
                    } else {
                        erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser um NÚMERO INTEIRO. Valor inválido: '" + valorFkFuncStr + "'");
                    }
                } else {
                    try {
                        int fkFunc = Integer.parseInt(valorFkFuncStr);
                        if (fkFunc < 0) {
                            erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser não negativo");
                        }
                    } catch (NumberFormatException e) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Erro ao converter para número: '" + valorFkFuncStr + "'");
                    }
                }
            }
        }

        // Coluna 6 - funcionalidadesPartilhadas (opcional, string)
        Cell cell6 = row.getCell(6);
        if (cell6 != null && !isCellEmpty(cell6)) {
            String partilhadas = FuncionsHelper.getCellAsString(cell6);
            if (partilhadas != null && partilhadas.length() > 250) {
                erros.add("❌ Linha " + linhaReal + ", Coluna G (funcionalidadesPartilhadas): Excede o limite de 250 caracteres");
            }
        }

        // Coluna 7 - url (opcional, string)
        Cell cell7 = row.getCell(7);
        if (cell7 != null && !isCellEmpty(cell7)) {
            String url = FuncionsHelper.getCellAsString(cell7);
            if (url != null && url.length() > 100) {
                erros.add("❌ Linha " + linhaReal + ", Coluna H (url): Excede o limite de 100 caracteres");
            }
        }

        return erros;
    }

    /**
     * Verifica se uma célula está vazia
     */
    private static boolean isCellEmpty(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return true;
        }
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim().isEmpty();
        }
        return false;
    }

    /**
     * Método auxiliar para obter o nome da coluna baseado no índice
     */
    private static String getColumnName(int columnIndex) {
        StringBuilder columnName = new StringBuilder();
        while (columnIndex >= 0) {
            int remainder = columnIndex % 26;
            columnName.insert(0, (char) ('A' + remainder));
            columnIndex = (columnIndex / 26) - 1;
        }
        return columnName.toString();
    }
}
