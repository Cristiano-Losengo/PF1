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
import java.util.regex.Pattern;

public class TipoFuncionalidadeLoader {

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd-HH-mm");
    private static final long TEMPO_LIMITE_EM_MINUTOS = 120; // 2 horas em minutos
    
    // Patterns para validação - CORRIGIDO para melhor suporte a Unicode
    private static final Pattern LETTERS_ONLY_PATTERN = 
        Pattern.compile("^[\\p{L}\\p{M}\\s\\-.,;:?!'\"()\\[\\]{}_/]+$", Pattern.UNICODE_CHARACTER_CLASS);
    private static final Pattern INTEGER_PATTERN = Pattern.compile("^\\d+$");
    // CORREÇÃO: Permitir o valor 1000 específico, com ou sem ponto e vírgula
    private static final Pattern SHARED_FUNCS_PATTERN = Pattern.compile("^1000;?$|^\\d+(;\\d+)*$|^$");
    private static final Pattern URL_PATTERN = Pattern.compile("^[\\p{L}\\p{N}\\s\\-._~:/?#\\[\\]@!$&'()*+,;=]+$");

    @Transactional
    public static Map<String, Object> insertBothSheets(
            MultipartFile file,
            TipoFuncionalidadeRepository tipoFuncionalidadeRepository,
            FuncionalidadeRepository funcionalidadeRepository,
            VersaoService versaoService) {
        
        Map<String, Object> resultado = new HashMap<>();
        List<Map<String, Object>> errosDetalhados = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (file.isEmpty()) {
            errosDetalhados.add(criarDetalheErro("1", "A", "cabeçalho", "[VAZIO]", "Ficheiro está vazio"));
            resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
            resultado.put("sucesso", false);
            return resultado;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {
            
            System.out.println("=== INICIANDO IMPORTACAO DE DUAS FOLHAS ===");
            System.out.println("Número de folhas no arquivo: " + workbook.getNumberOfSheets());
            
            // Log dos nomes das folhas
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                System.out.println("Folha " + i + ": " + workbook.getSheetName(i));
            }
            
            // Verificar se temos pelo menos 1 folha (aceitamos 1 ou 2 folhas)
            if (workbook.getNumberOfSheets() < 1) {
                errosDetalhados.add(criarDetalheErro("1", "A", "cabeçalho", "[N/A]", "O arquivo Excel deve ter pelo menos uma folha"));
                resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                    "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
                resultado.put("sucesso", false);
                return resultado;
            }
            
            // DECISÃO: Verificar qual folha contém quais dados
            Sheet primeiraFolha = workbook.getSheetAt(0);
            Sheet segundaFolha = workbook.getNumberOfSheets() > 1 ? workbook.getSheetAt(1) : null;
            
            // Analisar conteúdo para determinar qual folha é qual
            boolean[] tiposFolhas = determinarTipoFolhas(primeiraFolha, segundaFolha);
            
            Sheet sheetFunc, sheetTipos;
            if (tiposFolhas[0] && tiposFolhas[1]) {
                // Ambas as folhas estão no arquivo, ordem normal
                sheetFunc = primeiraFolha;
                sheetTipos = segundaFolha;
            } else if (tiposFolhas[0] && !tiposFolhas[1]) {
                // Apenas funcionalidades na primeira folha
                sheetFunc = primeiraFolha;
                sheetTipos = null;
                warnings.add("⚠️ Apenas uma folha encontrada (funcionalidades). Tipos não serão importados.");
            } else if (!tiposFolhas[0] && tiposFolhas[1]) {
                // Folhas invertidas
                sheetFunc = segundaFolha;
                sheetTipos = primeiraFolha;
            } else {
                // Não conseguiu determinar
                sheetFunc = primeiraFolha;
                sheetTipos = segundaFolha;
                warnings.add("⚠️ Não foi possível determinar automaticamente os tipos das folhas. Tentando processar ambas.");
            }
            
            System.out.println("Sheet Funcionalidades: " + (sheetFunc != null ? "Sim" : "Não"));
            System.out.println("Sheet Tipos: " + (sheetTipos != null ? "Sim" : "Não"));
            
            // PRIMEIRO: Processar tipos de funcionalidade (se existir)
            if (sheetTipos != null) {
                System.out.println("=== PROCESSANDO FOLHA DE TIPOS ===");
                List<Map<String, Object>> errosTiposDetalhados = processarFolhaTipos(
                    sheetTipos, file, tipoFuncionalidadeRepository, versaoService, warnings);
                
                if (!errosTiposDetalhados.isEmpty()) {
                    errosDetalhados.addAll(errosTiposDetalhados);
                    resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                        "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
                    resultado.put("sucesso", false);
                    resultado.put("tipo_erro", "tipos");
                    if (!warnings.isEmpty()) {
                        resultado.put("warnings", warnings);
                    }
                    return resultado;
                }
                
                System.out.println("✅ Tipos de funcionalidade processados com sucesso");
                
                // Aguardar um pouco para garantir que os tipos estejam disponíveis
                Thread.sleep(500);
            } else {
                System.out.println("⚠️ Folha de tipos não encontrada ou não identificada");
            }
            
            // SEGUNDO: Processar funcionalidades
            if (sheetFunc != null) {
                System.out.println("=== PROCESSANDO FOLHA DE FUNCIONALIDADES ===");
                List<Map<String, Object>> errosFuncDetalhados = processarFolhaFuncionalidadesMelhorada(
                    sheetFunc, file, funcionalidadeRepository, tipoFuncionalidadeRepository, versaoService, warnings);
                
                if (!errosFuncDetalhados.isEmpty()) {
                    errosDetalhados.addAll(errosFuncDetalhados);
                    if (sheetTipos != null) {
                        warnings.add("⚠️ ATENÇÃO: Funcionalidades não foram importadas devido a erros, mas os tipos foram.");
                    }
                    resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                        "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
                    resultado.put("sucesso", false);
                    resultado.put("tipo_erro", "funcionalidades");
                    if (!warnings.isEmpty()) {
                        resultado.put("warnings", warnings);
                    }
                    return resultado;
                }
                
                System.out.println("✅ Funcionalidades processadas com sucesso");
            } else {
                errosDetalhados.add(criarDetalheErro("1", "A", "cabeçalho", "[NÃO ENCONTRADO]", "Folha de funcionalidades não encontrada"));
                resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                    "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
                resultado.put("sucesso", false);
                if (!warnings.isEmpty()) {
                    resultado.put("warnings", warnings);
                }
                return resultado;
            }
            
            // Obter contagens
            long totalTipos = tipoFuncionalidadeRepository.count();
            long totalFunc = funcionalidadeRepository.count();
            
            // Mensagem de sucesso
            StringBuilder mensagem = new StringBuilder();
            mensagem.append("✅ IMPORTACAO COMPLETA COM SUCESSO!\n");
            mensagem.append("📊 RESUMO:\n");
            
            if (sheetTipos != null) {
                mensagem.append("   • Tipos de Funcionalidade: ").append(totalTipos).append("\n");
            } else {
                mensagem.append("   • Tipos de Funcionalidade: Não importados (folha não encontrada)\n");
            }
            
            mensagem.append("   • Funcionalidades: ").append(totalFunc).append("\n");
            
            // Obter versões atualizadas
            Versao versaoTipos = versaoService.obterVersao(Defs.TIPO_FUNCIONALIDADE);
            Versao versaoFunc = versaoService.obterVersao(Defs.FUNCIONALIDADE);
            
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            if (versaoTipos != null) {
                mensagem.append("   • Versão Tipos: ").append(sdf.format(versaoTipos.getData())).append("\n");
            }
            if (versaoFunc != null) {
                mensagem.append("   • Versão Funcionalidades: ").append(sdf.format(versaoFunc.getData())).append("\n");
            }
            
            resultado.put("mensagem", mensagem.toString());
            resultado.put("sucesso", true);
            resultado.put("total_tipos", totalTipos);
            resultado.put("total_funcionalidades", totalFunc);
            
            if (!warnings.isEmpty()) {
                resultado.put("warnings", warnings);
            }
            
        } catch (Exception e) {
            errosDetalhados.add(criarDetalheErro("1", "A", "geral", "[ERRO SISTEMA]", "Erro ao processar arquivo: " + e.getMessage()));
            resultado.put("erros", criarEstruturaErro("2001", "Processamento concluído com avisos", 
                "Requisição realizada com sucesso!", errosDetalhados, errosDetalhados.size()));
            resultado.put("sucesso", false);
            e.printStackTrace();
        }
        
        return resultado;
    }

    /**
     * Cria estrutura de erro no formato melhorado
     */
    private static List<String> criarEstruturaErro(String codigo, String status, String mensagemServidor, 
                                                   List<Map<String, Object>> detalhesErros, int totalErros) {
        
        List<String> errosFormatados = new ArrayList<>();
        
        // Cabeçalho
        errosFormatados.add("# Detalhes do erro");
        errosFormatados.add("");
        errosFormatados.add("- [ ] " + totalErros + " erro(s) de validação encontrado(s) no arquivo Excel");
        errosFormatados.add("  Código: " + codigo + " | Status: " + status);
        errosFormatados.add("");
        errosFormatados.add("**Mensagem do servidor:**");
        errosFormatados.add("  " + mensagemServidor);
        errosFormatados.add("");
        
        if (detalhesErros != null && !detalhesErros.isEmpty()) {
            errosFormatados.add("**Detalhes dos erros encontrados:**");
            errosFormatados.add("");
            
            for (Map<String, Object> erro : detalhesErros) {
                String linha = (String) erro.get("linha");
                String coluna = (String) erro.get("coluna");
                String campo = (String) erro.get("campo");
                String valor = (String) erro.get("valor");
                String motivo = (String) erro.get("motivo");
                
                errosFormatados.add("**Linha " + linha + ", Coluna " + coluna + " (" + campo + ")**");
                errosFormatados.add("**Valor:** " + valor);
                errosFormatados.add("**Motivo do erro:**");
                
                // Tratar mensagens com múltiplas linhas
                if (motivo.contains("\n")) {
                    String[] linhasMotivo = motivo.split("\n");
                    for (String linhaMotivo : linhasMotivo) {
                        errosFormatados.add("  " + linhaMotivo.trim());
                    }
                } else {
                    errosFormatados.add("  " + motivo);
                }
                
                errosFormatados.add("");
            }
        }
        
        // Próximos passos
        errosFormatados.add("**Próximos passos:**");
        errosFormatados.add("- Corrija os erros listados acima no arquivo Excel");
        errosFormatados.add("- Verifique se todas as colunas estão preenchidas corretamente");
        errosFormatados.add("- Salve o arquivo e tente fazer o upload novamente");
        errosFormatados.add("- Consulte a documentação para o formato correto dos campos");
        
        return errosFormatados;
    }

    /**
     * Cria um detalhe de erro individual MELHORADO
     */
    private static Map<String, Object> criarDetalheErro(String linha, String coluna, String campo, String valor, String motivo) {
        Map<String, Object> erro = new HashMap<>();
        erro.put("linha", linha);
        erro.put("coluna", coluna);
        erro.put("campo", campo);
        erro.put("valor", valor);
        erro.put("motivo", motivo);
        return erro;
    }

    /**
     * Verifica diferenças entre a data/hora do arquivo e do sistema
     * Retorna erros se houver diferenças - MELHORADO
     */
    private static List<Map<String, Object>> verificarDiferencasDataHora(
            Date dataArquivo, Date dataAtual, String tipo) {
        
        List<Map<String, Object>> erros = new ArrayList<>();
        Calendar calArquivo = Calendar.getInstance();
        calArquivo.setTime(dataArquivo);
        
        Calendar calAtual = Calendar.getInstance();
        calAtual.setTime(dataAtual);
        
        SimpleDateFormat sdfData = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdfHora = new SimpleDateFormat("HH:mm");
        SimpleDateFormat sdfCompleto = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        
        // Verificar se a data é FUTURA
        if (dataArquivo.after(dataAtual)) {
            StringBuilder motivo = new StringBuilder();
            motivo.append("DATA FUTURA: O arquivo de ").append(tipo).append(" possui uma data do FUTURO.\n");
            motivo.append("  📅 Data/Hora do arquivo: ").append(sdfCompleto.format(dataArquivo)).append("\n");
            motivo.append("  📅 Data/Hora atual do sistema: ").append(sdfCompleto.format(dataAtual)).append("\n");
            motivo.append("  ⚠️ A data/hora do arquivo NÃO PODE SER FUTURA em relação ao sistema.\n");
            motivo.append("  ℹ️ Por favor, ajuste a data/hora do arquivo para a data/hora atual ou anterior.");
            
            erros.add(criarDetalheErro("1", "B", "data", sdfCompleto.format(dataArquivo), motivo.toString()));
            return erros;
        }
        
        // Verificar se a data é MUITO ANTIGA (mais de 2 horas)
        long diferencaEmMillis = dataAtual.getTime() - dataArquivo.getTime();
        long diferencaEmMinutos = diferencaEmMillis / (1000 * 60);
        
        if (diferencaEmMinutos > TEMPO_LIMITE_EM_MINUTOS) {
            StringBuilder motivo = new StringBuilder();
            motivo.append("DATA MUITO ANTIGA: O arquivo de ").append(tipo).append(" possui uma data muito antiga.\n");
            motivo.append("  📅 Data/Hora do arquivo: ").append(sdfCompleto.format(dataArquivo)).append("\n");
            motivo.append("  📅 Data/Hora atual do sistema: ").append(sdfCompleto.format(dataAtual)).append("\n");
            motivo.append("  ⏰ Diferença: ").append(diferencaEmMinutos).append(" minutos (limite: ").append(TEMPO_LIMITE_EM_MINUTOS).append(" minutos)\n");
            motivo.append("  ⚠️ O arquivo deve ter a data/hora ATUAL ou muito próxima.\n");
            motivo.append("  ℹ️ Por favor, atualize a data/hora do arquivo para a data/hora atual.");
            
            erros.add(criarDetalheErro("1", "B", "data", sdfCompleto.format(dataArquivo), motivo.toString()));
            return erros;
        }
        
        // Verificar diferenças específicas de data e hora
        boolean dataDiferente = calArquivo.get(Calendar.YEAR) != calAtual.get(Calendar.YEAR) ||
                               calArquivo.get(Calendar.MONTH) != calAtual.get(Calendar.MONTH) ||
                               calArquivo.get(Calendar.DAY_OF_MONTH) != calAtual.get(Calendar.DAY_OF_MONTH);
        
        boolean horaDiferente = calArquivo.get(Calendar.HOUR_OF_DAY) != calAtual.get(Calendar.HOUR_OF_DAY) ||
                               calArquivo.get(Calendar.MINUTE) != calAtual.get(Calendar.MINUTE);
        
        String dataArquivoStr = sdfData.format(dataArquivo);
        String horaArquivoStr = sdfHora.format(dataArquivo);
        String dataAtualStr = sdfData.format(dataAtual);
        String horaAtualStr = sdfHora.format(dataAtual);
        
        // Se tanto data quanto hora forem diferentes (mas dentro do limite de 2 horas)
        if (dataDiferente && horaDiferente && diferencaEmMinutos <= TEMPO_LIMITE_EM_MINUTOS) {
            StringBuilder motivo = new StringBuilder();
            motivo.append("DATA E HORA DIFERENTES: A data e hora do arquivo de ").append(tipo).append(" estão diferentes do sistema.\n");
            motivo.append("  📅 Data do arquivo: ").append(dataArquivoStr).append(" | Hora: ").append(horaArquivoStr).append("\n");
            motivo.append("  📅 Data do sistema: ").append(dataAtualStr).append(" | Hora: ").append(horaAtualStr).append("\n");
            motivo.append("  ⏰ Diferença: ").append(diferencaEmMinutos).append(" minutos\n");
            motivo.append("  ⚠️ A data/hora do arquivo deve ser IGUAL à data/hora atual do sistema.\n");
            motivo.append("  ℹ️ Por favor, atualize a data/hora do arquivo para: ").append(sdfCompleto.format(dataAtual));
            
            erros.add(criarDetalheErro("1", "B", "data", dataArquivoStr + " " + horaArquivoStr, motivo.toString()));
        }
        // Se apenas a data for diferente (mas dentro do limite de 2 horas)
        else if (dataDiferente && diferencaEmMinutos <= TEMPO_LIMITE_EM_MINUTOS) {
            StringBuilder motivo = new StringBuilder();
            motivo.append("DATA DIFERENTE: A data do arquivo de ").append(tipo).append(" está diferente do sistema.\n");
            motivo.append("  📅 Data do arquivo: ").append(dataArquivoStr).append(" | Hora: ").append(horaArquivoStr).append("\n");
            motivo.append("  📅 Data do sistema: ").append(dataAtualStr).append(" | Hora: ").append(horaAtualStr).append("\n");
            motivo.append("  ⚠️ A DATA do arquivo deve ser IGUAL à data atual do sistema.\n");
            motivo.append("  ℹ️ Por favor, atualize a data do arquivo para: ").append(dataAtualStr);
            
            erros.add(criarDetalheErro("1", "B", "data", dataArquivoStr, motivo.toString()));
        }
        // Se apenas a hora for diferente (mas a data é a mesma)
        else if (horaDiferente && !dataDiferente) {
            StringBuilder motivo = new StringBuilder();
            motivo.append("HORA DIFERENTE: A hora do arquivo de ").append(tipo).append(" está diferente do sistema.\n");
            motivo.append("  📅 Data: ").append(dataArquivoStr).append(" | Hora do arquivo: ").append(horaArquivoStr).append("\n");
            motivo.append("  📅 Data: ").append(dataAtualStr).append(" | Hora do sistema: ").append(horaAtualStr).append("\n");
            motivo.append("  ⚠️ A HORA do arquivo deve ser IGUAL à hora atual do sistema.\n");
            motivo.append("  ℹ️ Por favor, atualize a hora do arquivo para: ").append(horaAtualStr);
            
            erros.add(criarDetalheErro("1", "B", "data", horaArquivoStr, motivo.toString()));
        }
        
        return erros;
    }

    /**
     * Verifica se a data do arquivo é válida - VERSÃO SIMPLIFICADA
     * Agora usa a função verificarDiferencasDataHora acima
     */
    private static List<Map<String, Object>> validarDataArquivo(Date dataArquivo, String tipo, VersaoService versaoService) {
        List<Map<String, Object>> erros = new ArrayList<>();
        Date dataAtual = new Date();
        
        // Usar a nova função melhorada para verificar data/hora
        List<Map<String, Object>> errosDataHora = verificarDiferencasDataHora(dataArquivo, dataAtual, tipo);
        if (!errosDataHora.isEmpty()) {
            return errosDataHora;
        }
        
        // Verificar se já existe uma versão com a mesma data
        Versao versaoAtual = versaoService.obterVersao(
            tipo.equals("tipos de funcionalidade") ? Defs.TIPO_FUNCIONALIDADE : Defs.FUNCIONALIDADE
        );
        
        if (versaoAtual != null) {
            Date dataVersaoAtual = versaoAtual.getData();
            
            // Calcular diferença em minutos entre as duas datas
            long diffVersaoMillis = Math.abs(dataArquivo.getTime() - dataVersaoAtual.getTime());
            long diffVersaoMinutos = diffVersaoMillis / (1000 * 60);
            
            // Se a diferença for menor que 2 minutos, consideramos como a mesma data/hora
            if (diffVersaoMinutos < 2) {
                SimpleDateFormat sdfDetalhado = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String dataArquivoDetalhada = sdfDetalhado.format(dataArquivo);
                String dataVersaoDetalhada = sdfDetalhado.format(dataVersaoAtual);
                
                StringBuilder motivo = new StringBuilder();
                motivo.append("ARQUIVO JÁ IMPORTADO: Este arquivo já foi importado anteriormente.\n");
                motivo.append("  📅 Data/Hora do arquivo atual: ").append(dataArquivoDetalhada).append("\n");
                motivo.append("  📅 Data/Hora da última importação: ").append(dataVersaoDetalhada).append("\n");
                motivo.append("  ⏰ Diferença: ").append(diffVersaoMinutos).append(" minutos\n");
                motivo.append("  ℹ️ Para importar novamente, atualize a data/hora do arquivo.");
                
                erros.add(criarDetalheErro("1", "B", "data", dataArquivoDetalhada, motivo.toString()));
                return erros;
            }
        }
        
        // Verificar se a data é mais antiga que a última versão (lógica existente)
        int comparacao = versaoService.comparaDataVersao(
            tipo.equals("tipos de funcionalidade") ? Defs.TIPO_FUNCIONALIDADE : Defs.FUNCIONALIDADE, 
            dataArquivo
        );
        
        if (comparacao < 0) {
            Versao versaoAtual2 = versaoService.obterVersao(
                tipo.equals("tipos de funcionalidade") ? Defs.TIPO_FUNCIONALIDADE : Defs.FUNCIONALIDADE
            );
            if (versaoAtual2 != null) {
                Date dataVersaoAtual = versaoAtual2.getData();
                String dataVersaoAtualStr = DATE_FORMAT.format(dataVersaoAtual);
                String dataArquivoStr = DATE_FORMAT.format(dataArquivo);
                
                StringBuilder motivo = new StringBuilder();
                motivo.append("VERSÃO REJEITADA: O arquivo de ").append(tipo).append(" é mais antigo que a versão atual.\n");
                motivo.append("  📅 Data/Hora do arquivo: ").append(dataArquivoStr).append("\n");
                motivo.append("  📅 Última versão importada: ").append(dataVersaoAtualStr).append("\n");
                motivo.append("  ℹ️ Para importar, use um arquivo com data/hora igual ou posterior a: ").append(dataVersaoAtualStr);
                
                erros.add(criarDetalheErro("1", "B", "data", dataArquivoStr, motivo.toString()));
                return erros;
            }
        }
        
        return erros;
    }

    /**
     * Determina automaticamente qual folha contém quais dados
     */
    private static boolean[] determinarTipoFolhas(Sheet folha1, Sheet folha2) {
        boolean[] resultado = new boolean[2]; // [0] = folha1 é funcionalidades, [1] = folha2 é tipos
        
        // Verificar folha 1
        if (folha1 != null) {
            resultado[0] = folhaPareceSerFuncionalidades(folha1);
        }
        
        // Verificar folha 2
        if (folha2 != null) {
            resultado[1] = folhaPareceSerTipos(folha2);
        } else {
            resultado[1] = false;
        }
        
        return resultado;
    }

    private static boolean folhaPareceSerFuncionalidades(Sheet sheet) {
        // Verificar se contém "pk_funcionalidade" ou "designacao" nas primeiras linhas
        for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                for (int j = 0; j < Math.min(5, row.getLastCellNum()); j++) {
                    Cell cell = row.getCell(j);
                    if (cell != null) {
                        String valor = FuncionsHelper.getCellAsString(cell);
                        if (valor != null) {
                            String valorLower = valor.toLowerCase().trim();
                            if (valorLower.contains("pk_funcionalidade") || 
                                valorLower.contains("designacao") ||
                                valorLower.contains("descricao")) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    private static boolean folhaPareceSerTipos(Sheet sheet) {
        // Verificar se contém "pk_tipo_funcionalidade" ou "designacao" nas primeiras linhas
        for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                for (int j = 0; j < Math.min(3, row.getLastCellNum()); j++) {
                    Cell cell = row.getCell(j);
                    if (cell != null) {
                        String valor = FuncionsHelper.getCellAsString(cell);
                        if (valor != null) {
                            String valorLower = valor.toLowerCase().trim();
                            if (valorLower.contains("pk_tipo_funcionalidade") || 
                                valorLower.contains("designacao") ||
                                valorLower.contains("tipo")) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Processa a folha de tipos (nova versão)
     */
    private static List<Map<String, Object>> processarFolhaTipos(
            Sheet sheet, 
            MultipartFile file, 
            TipoFuncionalidadeRepository tipoFuncionalidadeRepository, 
            VersaoService versaoService,
            List<String> warnings) {
        
        List<Map<String, Object>> erros = new ArrayList<>();

        try {
            // Encontrar cabeçalho baseado no formato fornecido
            System.out.println("=== ANALISANDO CABEÇALHO TIPOS (NOVO FORMATO) ===");
            System.out.println("Total de linhas na folha: " + (sheet.getLastRowNum() + 1));
            
            // NOVO: Encontrar as linhas de cabeçalho (nome, descricao, data)
            String nome = null, descricao = null, dataString = null;
            
            for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Cell cell0 = row.getCell(0);
                    if (cell0 != null) {
                        String valorCell0 = FuncionsHelper.getCellAsString(cell0);
                        if (valorCell0 != null) {
                            valorCell0 = valorCell0.trim();
                            if (valorCell0.equalsIgnoreCase("nome")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    nome = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado nome: " + nome);
                                }
                            } else if (valorCell0.equalsIgnoreCase("descricao")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    descricao = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado descricao: " + descricao);
                                }
                            } else if (valorCell0.equalsIgnoreCase("data")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    dataString = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado data: " + dataString);
                                }
                            }
                        }
                    }
                }
            }

            // Validar cabeçalho
            if (nome == null || nome.isEmpty()) {
                erros.add(criarDetalheErro("1", "B", "nome", "[VAZIO]", "Cabeçalho 'nome' não encontrado ou vazio"));
            }
            if (descricao == null || descricao.isEmpty()) {
                erros.add(criarDetalheErro("1", "C", "descricao", "[VAZIO]", "Cabeçalho 'descricao' não encontrado ou vazio"));
            }
            if (dataString == null || dataString.isEmpty()) {
                erros.add(criarDetalheErro("1", "D", "data", "[VAZIO]", "Cabeçalho 'data' não encontrado ou vazio"));
            }

            if (!erros.isEmpty()) {
                return erros;
            }

            // Converter data do arquivo
            Date dataArquivo;
            try {
                dataArquivo = DATE_FORMAT.parse(dataString);
            } catch (ParseException e) {
                erros.add(criarDetalheErro("1", "D", "data", dataString, "Formato de data inválido. Use: yyyy-MM-dd-HH-mm"));
                return erros;
            }

            // Validar data do arquivo (nova validação)
            List<Map<String, Object>> errosData = validarDataArquivo(dataArquivo, "tipos de funcionalidade", versaoService);
            if (!errosData.isEmpty()) {
                return errosData;
            }

            System.out.println("✅ Versão válida - continuando com importação de tipos...");

            // Encontrar início dos dados
            int startIndex = encontrarInicioDadosTiposNovoFormato(sheet);
            if (startIndex == -1) {
                erros.add(criarDetalheErro("1", "A", "cabeçalho", "[NÃO ENCONTRADO]", "Não foi possível encontrar o início dos dados na folha de tipos"));
                return erros;
            }

            System.out.println("Iniciando leitura de tipos na linha: " + (startIndex + 1));

            // Processar linhas com verificação de duplicatas
            Map<Integer, List<Integer>> pkMap = new HashMap<>();
            Map<String, List<Integer>> designacaoMap = new HashMap<>();
            List<TipoFuncionalidade> tiposProcessados = new ArrayList<>();

            int index = startIndex;
            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                int linhaReal = index + 1;
                
                if (row == null || isEmptyRow(row)) {
                    index++;
                    continue;
                }

                // Validar linha
                List<Map<String, Object>> errosLinha = validarLinhaTipoFuncionalidadeNovoFormato(row, index, new HashSet<>());
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    index++;
                    continue;
                }

                try {
                    TipoFuncionalidade tipoFuncionalidade = processarLinhaTipoFuncionalidadeNovoFormato(row);
                    if (tipoFuncionalidade != null) {
                        tiposProcessados.add(tipoFuncionalidade);
                        
                        // Coletar para verificação de duplicatas
                        int pk = tipoFuncionalidade.getPkTipoFuncionalidade();
                        pkMap.computeIfAbsent(pk, k -> new ArrayList<>()).add(linhaReal);
                        
                        String designacao = tipoFuncionalidade.getDesignacao();
                        if (designacao != null) {
                            designacaoMap.computeIfAbsent(designacao, k -> new ArrayList<>()).add(linhaReal);
                        }
                    }
                } catch (Exception e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "geral", "[ERRO PROCESSAMENTO]", "Erro ao processar - " + e.getMessage()));
                }
                
                index++;
            }

            // Verificar duplicatas de PK
            for (Map.Entry<Integer, List<Integer>> entry : pkMap.entrySet()) {
                if (entry.getValue().size() > 1) {
                    String linhasStr = entry.getValue().toString().replace("[", "").replace("]", "");
                    erros.add(criarDetalheErro(String.valueOf(entry.getValue().get(0)), "A", "pk_tipo_funcionalidade", 
                        String.valueOf(entry.getKey()), "PK_TIPO_FUNCIONALIDADE repetida nas linhas: [" + linhasStr + "]"));
                }
            }

            // Verificar duplicatas de Designação
            for (Map.Entry<String, List<Integer>> entry : designacaoMap.entrySet()) {
                if (entry.getValue().size() > 1) {
                    String linhasStr = entry.getValue().toString().replace("[", "").replace("]", "");
                    erros.add(criarDetalheErro(String.valueOf(entry.getValue().get(0)), "B", "designacao", 
                        entry.getKey(), "DESIGNAÇÃO repetida nas linhas: [" + linhasStr + "]"));
                }
            }

            // Se houver erros, retornar
            if (!erros.isEmpty()) {
                return erros;
            }

            // Salvar no banco se não houver erros
            for (TipoFuncionalidade tipo : tiposProcessados) {
                tipoFuncionalidadeRepository.save(tipo);
            }

            // Atualizar versão
            versaoService.atualizarDataVersao(
                Defs.TIPO_FUNCIONALIDADE, 
                dataArquivo, 
                "Importação de tipos de funcionalidade - " + new Date()
            );

        } catch (Exception e) {
            erros.add(criarDetalheErro("1", "A", "geral", "[ERRO SISTEMA]", "Erro ao processar folha de tipos: " + e.getMessage()));
            e.printStackTrace();
        }

        return erros;
    }

    /**
     * Processa a folha de funcionalidades - VERSÃO MELHORADA COM VALIDAÇÃO DETALHADA
     */
    private static List<Map<String, Object>> processarFolhaFuncionalidadesMelhorada(
            Sheet sheet, 
            MultipartFile file, 
            FuncionalidadeRepository funcionalidadeRepository,
            TipoFuncionalidadeRepository tipoFuncionalidadeRepository,
            VersaoService versaoService,
            List<String> warnings) {
        
        List<Map<String, Object>> erros = new ArrayList<>();

        try {
            // Encontrar cabeçalho baseado no formato fornecido
            System.out.println("=== ANALISANDO CABEÇALHO FUNCIONALIDADES (NOVO FORMATO) ===");
            
            // Encontrar as linhas de cabeçalho (nome, descricao, data)
            String nome = null, descricao = null, dataString = null;
            
            for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Cell cell0 = row.getCell(0);
                    if (cell0 != null) {
                        String valorCell0 = FuncionsHelper.getCellAsString(cell0);
                        if (valorCell0 != null) {
                            valorCell0 = valorCell0.trim();
                            if (valorCell0.equalsIgnoreCase("nome")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    nome = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado nome: " + nome);
                                }
                            } else if (valorCell0.equalsIgnoreCase("descricao")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    descricao = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado descricao: " + descricao);
                                }
                            } else if (valorCell0.equalsIgnoreCase("data")) {
                                Cell cell1 = row.getCell(1);
                                if (cell1 != null) {
                                    dataString = FuncionsHelper.getCellAsString(cell1);
                                    System.out.println("Encontrado data: " + dataString);
                                }
                            }
                        }
                    }
                }
            }

            // Validar cabeçalho
            if (nome == null || nome.isEmpty()) {
                erros.add(criarDetalheErro("1", "B", "nome", "[VAZIO]", "Cabeçalho 'nome' não encontrado ou vazio"));
            }
            if (descricao == null || descricao.isEmpty()) {
                erros.add(criarDetalheErro("1", "C", "descricao", "[VAZIO]", "Cabeçalho 'descricao' não encontrado ou vazio"));
            }
            if (dataString == null || dataString.isEmpty()) {
                erros.add(criarDetalheErro("1", "D", "data", "[VAZIO]", "Cabeçalho 'data' não encontrado ou vazio"));
            }

            if (!erros.isEmpty()) {
                return erros;
            }

            // Converter data do arquivo
            Date dataArquivo;
            try {
                dataArquivo = DATE_FORMAT.parse(dataString);
            } catch (ParseException e) {
                erros.add(criarDetalheErro("1", "D", "data", dataString, "Formato de data inválido. Use: yyyy-MM-dd-HH-mm"));
                return erros;
            }

            // Validar data do arquivo (nova validação)
            List<Map<String, Object>> errosData = validarDataArquivo(dataArquivo, "funcionalidades", versaoService);
            if (!errosData.isEmpty()) {
                return errosData;
            }

            System.out.println("✅ Versão válida - continuando com importação de funcionalidades...");

            // Encontrar início dos dados - COMEÇA NA LINHA 3 (índice 2) para funcionalidades
            int startIndex = encontrarInicioDadosFuncionalidadesNovoFormato(sheet);
            if (startIndex == -1) {
                // Se não encontrou automaticamente, tenta começar na linha 3 (índice 2)
                startIndex = 2;
                System.out.println("⚠️ Início dos dados não encontrado automaticamente, usando linha " + (startIndex + 1) + " como padrão");
            }

            System.out.println("Iniciando leitura de funcionalidades na linha: " + (startIndex + 1));

            // Processar linhas com validação detalhada
            Map<Integer, List<Integer>> pkMap = new HashMap<>();
            Map<String, List<Integer>> designacaoMap = new HashMap<>();
            List<FuncionalidadeData> funcionalidadesData = new ArrayList<>();

            int index = startIndex;
            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                int linhaReal = index + 1;
                
                if (row == null || isEmptyRow(row)) {
                    break;
                }

                // Validar linha com validação melhorada
                List<Map<String, Object>> errosLinha = validarLinhaFuncionalidadeMelhorada(
                    row, index, pkMap.keySet(), tipoFuncionalidadeRepository);
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    index++;
                    continue;
                }

                try {
                    FuncionalidadeData funcData = processarLinhaFuncionalidadeDataNovoFormato(row);
                    if (funcData != null) {
                        funcionalidadesData.add(funcData);
                        
                        // Coletar para verificação de duplicatas
                        if (funcData.pkFuncionalidade != null) {
                            pkMap.computeIfAbsent(funcData.pkFuncionalidade, k -> new ArrayList<>()).add(linhaReal);
                        }
                        
                        if (funcData.designacao != null) {
                            designacaoMap.computeIfAbsent(funcData.designacao, k -> new ArrayList<>()).add(linhaReal);
                        }
                    }
                } catch (Exception e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "geral", "[ERRO PROCESSAMENTO]", "Erro ao processar - " + e.getMessage()));
                }
                
                index++;
            }

            // Verificar duplicatas de PK com informações detalhadas
            for (Map.Entry<Integer, List<Integer>> entry : pkMap.entrySet()) {
                if (entry.getValue().size() > 1) {
                    String linhasStr = entry.getValue().toString().replace("[", "").replace("]", "");
                    erros.add(criarDetalheErro(String.valueOf(entry.getValue().get(0)), "A", "pk_funcionalidade", 
                        String.valueOf(entry.getKey()), "PK duplicada. Aparece nas linhas: [" + linhasStr + "]"));
                }
            }

            // Verificar duplicatas de Designação com informações detalhadas
            for (Map.Entry<String, List<Integer>> entry : designacaoMap.entrySet()) {
                if (entry.getValue().size() > 1) {
                    String linhasStr = entry.getValue().toString().replace("[", "").replace("]", "");
                    erros.add(criarDetalheErro(String.valueOf(entry.getValue().get(0)), "B", "designacao", 
                        entry.getKey(), "Designação duplicada. Aparece nas linhas: [" + linhasStr + "]"));
                }
            }

            // Se houver erros, retornar
            if (!erros.isEmpty()) {
                return erros;
            }

            // Ordenar funcionalidades para resolver dependências
            List<FuncionalidadeData> funcionalidadesOrdenadas = ordenarPorDependencia(funcionalidadesData);

            System.out.println("=== PRIMEIRA PASSAGEM: Criando funcionalidades sem relações pai-filho ===");
            
            // PRIMEIRA PASSAGEM: Criar todas as funcionalidades sem relações pai-filho
            Map<Integer, Funcionalidade> funcionalidadesTemporarias = new HashMap<>();
            Map<Integer, Integer> relacoesPaiFilho = new HashMap<>(); // Mapa: filho -> pai
            
            for (FuncionalidadeData funcData : funcionalidadesOrdenadas) {
                try {
                    // Verificar se o tipo de funcionalidade existe
                    if (!tipoFuncionalidadeRepository.existsById(funcData.fkTipoFuncionalidade)) {
                        erros.add(criarDetalheErro("1", "D", "fk_tipo_funcionalidade", 
                            String.valueOf(funcData.fkTipoFuncionalidade), 
                            "Tipo de funcionalidade ID " + funcData.fkTipoFuncionalidade + 
                            " não existe. Verifique a folha de tipos primeiro."));
                        continue;
                    }
                    
                    System.out.println("Processando funcionalidade ID: " + funcData.pkFuncionalidade + 
                                     ", Pai ID: " + funcData.fkFuncionalidade);
                    
                    // Criar funcionalidade sem a relação pai
                    Funcionalidade funcionalidade = new Funcionalidade();
                    
                    if (funcData.pkFuncionalidade > 0) {
                        funcionalidade.setPkFuncionalidade(funcData.pkFuncionalidade);
                    }
                    
                    funcionalidade.setDesignacao(funcData.designacao);
                    funcionalidade.setDescricao(funcData.descricao);
                    
                    // Buscar tipo de funcionalidade do banco
                    TipoFuncionalidade tipo = tipoFuncionalidadeRepository.findById(funcData.fkTipoFuncionalidade)
                        .orElseThrow(() -> new RuntimeException("Tipo de funcionalidade não encontrado: " + funcData.fkTipoFuncionalidade));
                    
                    funcionalidade.setFkTipoFuncionalidade(tipo);
                    funcionalidade.setGrupo(funcData.grupo);
                    
                    if (funcData.funcionalidadesPartilhadas != null) {
                        funcionalidade.setFuncionalidadesPartilhadas(funcData.funcionalidadesPartilhadas);
                    }
                    
                    if (funcData.url != null) {
                        funcionalidade.setUrl(funcData.url);
                    }
                    
                    // Salvar sem pai por enquanto
                    Funcionalidade funcSalva = funcionalidadeRepository.save(funcionalidade);
                    funcionalidadesTemporarias.put(funcData.pkFuncionalidade, funcSalva);
                    
                    // Armazenar relação pai-filho para segunda passagem
                    if (funcData.fkFuncionalidade != null && funcData.fkFuncionalidade > 0) {
                        relacoesPaiFilho.put(funcData.pkFuncionalidade, funcData.fkFuncionalidade);
                        System.out.println("  ↳ Relação pai-filho registrada: " + funcData.pkFuncionalidade + " -> " + funcData.fkFuncionalidade);
                    }
                    
                } catch (Exception e) {
                    erros.add(criarDetalheErro("1", "A", "geral", 
                        String.valueOf(funcData.pkFuncionalidade), 
                        "Erro ao processar funcionalidade ID " + funcData.pkFuncionalidade + ": " + e.getMessage()));
                    e.printStackTrace();
                }
            }

            // Se houver erros durante o processamento, retornar
            if (!erros.isEmpty()) {
                return erros;
            }

            System.out.println("=== SEGUNDA PASSAGEM: Atualizando relações pai-filho ===");
            
            // SEGUNDA PASSAGEM: Atualizar relações pai-filho
            for (Map.Entry<Integer, Integer> relacao : relacoesPaiFilho.entrySet()) {
                Integer filhoId = relacao.getKey();
                Integer paiId = relacao.getValue();
                
                System.out.println("Atualizando relação: filho ID " + filhoId + " -> pai ID " + paiId);
                
                Optional<Funcionalidade> funcFilhoOpt = funcionalidadeRepository.findById(filhoId);
                Optional<Funcionalidade> funcPaiOpt = funcionalidadeRepository.findById(paiId);
                
                if (funcFilhoOpt.isPresent() && funcPaiOpt.isPresent()) {
                    Funcionalidade funcFilho = funcFilhoOpt.get();
                    Funcionalidade funcPai = funcPaiOpt.get();
                    
                    // Definir relação pai-filho
                    funcFilho.setFkFuncionalidade(funcPai);
                    funcionalidadeRepository.save(funcFilho);
                    
                    System.out.println("  ✅ Relação atualizada: " + filhoId + " -> " + paiId);
                } else {
                    String mensagemErro;
                    if (!funcFilhoOpt.isPresent()) {
                        mensagemErro = "Funcionalidade filho ID " + filhoId + " não encontrada";
                    } else {
                        mensagemErro = "Funcionalidade pai ID " + paiId + " não encontrada";
                    }
                    System.out.println("  ❌ " + mensagemErro);
                    
                    // Adicionar erro detalhado
                    erros.add(criarDetalheErro("1", "F", "fk_funcionalidade", 
                        String.valueOf(paiId), 
                        "Não foi possível estabelecer relação pai-filho. " + mensagemErro + 
                        ". Filho ID: " + filhoId + ", Pai ID: " + paiId));
                }
            }

            // Se houver erros durante a segunda passagem, retornar
            if (!erros.isEmpty()) {
                return erros;
            }

            // Atualizar versão se houve sucesso
            versaoService.atualizarDataVersao(
                Defs.FUNCIONALIDADE, 
                dataArquivo, 
                "Importação de funcionalidades - " + new Date()
            );

        } catch (Exception e) {
            erros.add(criarDetalheErro("1", "A", "geral", "[ERRO SISTEMA]", "Erro ao processar folha de funcionalidades: " + e.getMessage()));
            e.printStackTrace();
        }

        return erros;
    }

    /**
     * Valida linha de funcionalidade - VERSÃO MELHORADA COM VALIDAÇÃO DETALHADA
     */
    private static List<Map<String, Object>> validarLinhaFuncionalidadeMelhorada(
            Row row, 
            int numeroLinha, 
            Set<Integer> pksProcessados,
            TipoFuncionalidadeRepository tipoFuncionalidadeRepository) {
        
        List<Map<String, Object>> erros = new ArrayList<>();
        int linhaReal = numeroLinha + 1;
        
        // Mapeamento de colunas
        String[] nomesColunas = {"A", "B", "C", "D", "E", "F", "G", "H"};
        String[] nomesCampos = {
            "pk_funcionalidade", "designacao", "descricao", "fk_tipo_funcionalidade",
            "grupo", "fk_funcionalidade", "funcionalidades_partilhadas", "url"
        };
        
        // Extrair valores das células
        String[] valores = new String[8];
        for (int i = 0; i < 8; i++) {
            Cell cell = row.getCell(i);
            valores[i] = (cell != null && !isCellEmpty(cell)) ? FuncionsHelper.getCellAsString(cell).trim() : "";
        }
        
        // Lista de valores comuns que devem ser aceitos (incluindo "Tipo de Problema", etc.)
        Set<String> valoresPermitidos = new HashSet<>(Arrays.asList(
            "tipo de problema", "descrição detalhada", "nome do denunciante",
            "descricao detalhada", "caixa de entrada", "caixa de seleção",
            "combobox", "input text", "input date", "input file", "checkbox"
        ));
        
        // Verificar se é linha de cabeçalho da tabela (ignorar)
        String primeiraColuna = valores[0].toLowerCase();
        if (primeiraColuna.contains("pk_funcionalidade") || primeiraColuna.contains("designacao")) {
            // É linha de cabeçalho, ignorar validação
            return erros;
        }
        
        // Validar pk_funcionalidade (coluna A)
        if (valores[0].isEmpty()) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[0], nomesCampos[0], 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            // Verificar se é inteiro
            if (!INTEGER_PATTERN.matcher(valores[0]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[0], nomesCampos[0], 
                    valores[0], "Deve ser um número inteiro (sem casas decimais)"));
            } else {
                try {
                    int pk = Integer.parseInt(valores[0]);
                    if (pk <= 0) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[0], nomesCampos[0], 
                            valores[0], "Deve ser maior que 0"));
                    } else if (pksProcessados.contains(pk)) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[0], nomesCampos[0], 
                            valores[0], "PK duplicada neste arquivo"));
                    }
                } catch (NumberFormatException e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[0], nomesCampos[0], 
                        valores[0], "Valor numérico inválido"));
                }
            }
        }
        
        // Validar designacao (coluna B) - CORRIGIDA
        if (valores[1].isEmpty()) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[1], nomesCampos[1], 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            // Verificação especial para valores comuns
            String designacaoLower = valores[1].toLowerCase();
            boolean designacaoPermitida = valoresPermitidos.stream()
                .anyMatch(designacaoLower::contains);
            
            // Se não for um valor permitido e não corresponder ao padrão, então gerar erro
            if (!designacaoPermitida && !LETTERS_ONLY_PATTERN.matcher(valores[1]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[1], nomesCampos[1], 
                    valores[1], "Deve conter apenas letras, acentuações e caracteres especiais (.,;:?!\"'()_-/). Números não são permitidos."));
            }
            
            // Verificar tamanho máximo
            if (valores[1].length() > 100) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[1], nomesCampos[1], 
                    valores[1], "Excede o limite de 100 caracteres"));
            }
        }
        
        // Validar descricao (coluna C) - CORRIGIDA
        if (valores[2].isEmpty()) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[2], nomesCampos[2], 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            // Verificação especial para valores comuns
            String descricaoLower = valores[2].toLowerCase();
            boolean descricaoPermitida = valoresPermitidos.stream()
                .anyMatch(descricaoLower::contains);
            
            // Se não for um valor permitido e não corresponder ao padrão, então gerar erro
            if (!descricaoPermitida && !LETTERS_ONLY_PATTERN.matcher(valores[2]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[2], nomesCampos[2], 
                    valores[2], "Deve conter apenas letras, acentuações e caracteres especiais (.,;:?!\"'()_-/). Números não são permitidos."));
            }
            
            // Verificar tamanho máximo
            if (valores[2].length() > 250) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[2], nomesCampos[2], 
                    valores[2], "Excede o limite de 250 caracteres"));
            }
        }
        
        // Validar fk_tipo_funcionalidade (coluna D)
        if (valores[3].isEmpty()) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[3], nomesCampos[3], 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            // Verificar se é inteiro
            if (!INTEGER_PATTERN.matcher(valores[3]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[3], nomesCampos[3], 
                    valores[3], "Deve ser um número inteiro (sem casas decimais)"));
            } else {
                try {
                    int fk = Integer.parseInt(valores[3]);
                    if (fk <= 0) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[3], nomesCampos[3], 
                            valores[3], "Deve ser maior que 0"));
                    } else if (tipoFuncionalidadeRepository != null) {
                        // Verificar se o tipo existe no banco
                        boolean tipoExiste = tipoFuncionalidadeRepository.existsById(fk);
                        if (!tipoExiste) {
                            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[3], nomesCampos[3], 
                                valores[3], "Tipo de funcionalidade ID " + fk + " não existe no sistema"));
                        }
                    }
                } catch (NumberFormatException e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[3], nomesCampos[3], 
                        valores[3], "Valor numérico inválido"));
                }
            }
        }
        
        // Validar grupo (coluna E)
        if (valores[4].isEmpty()) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[4], nomesCampos[4], 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            // Verificar se é inteiro
            if (!INTEGER_PATTERN.matcher(valores[4]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[4], nomesCampos[4], 
                    valores[4], "Deve ser um número inteiro (sem casas decimais)"));
            } else {
                try {
                    int grupo = Integer.parseInt(valores[4]);
                    if (grupo < 0) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[4], nomesCampos[4], 
                            valores[4], "Não pode ser negativo"));
                    }
                } catch (NumberFormatException e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[4], nomesCampos[4], 
                        valores[4], "Valor numérico inválido"));
                }
            }
        }
        
        // Validar fk_funcionalidade (coluna F) - OPCIONAL
        if (!valores[5].isEmpty()) {
            // Verificar se é inteiro
            if (!INTEGER_PATTERN.matcher(valores[5]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[5], nomesCampos[5], 
                    valores[5], "Deve ser um número inteiro (sem casas decimais) ou estar vazio"));
            } else {
                try {
                    int fk = Integer.parseInt(valores[5]);
                    if (fk < 0) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[5], nomesCampos[5], 
                            valores[5], "Não pode ser negativo"));
                    }
                } catch (NumberFormatException e) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[5], nomesCampos[5], 
                        valores[5], "Valor numérico inválido"));
                }
            }
        }
        
        // Validar funcionalidades_partilhadas (coluna G) - OPCIONAL
        if (!valores[6].isEmpty()) {
            // Verificar formato (números separados por ; ou o valor 1000 com ou sem ;)
            if (!SHARED_FUNCS_PATTERN.matcher(valores[6]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[6], nomesCampos[6], 
                    valores[6], "Formato inválido. Use números inteiros separados por ponto e vírgula (ex: 1001;1002) ou o valor 1000 (com ou sem ponto e vírgula)"));
            }
            
            // Verificar tamanho máximo
            if (valores[6].length() > 250) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[6], nomesCampos[6], 
                    valores[6], "Excede o limite de 250 caracteres"));
            }
        }
        
        // Validar url (coluna H) - OPCIONAL
        if (!valores[7].isEmpty()) {
            // Verificar se contém apenas caracteres válidos para URL
            if (!URL_PATTERN.matcher(valores[7]).matches()) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[7], nomesCampos[7], 
                    valores[7], "Deve conter apenas letras, números e caracteres especiais de URL (/.-_?)"));
            }
            
            // Verificar tamanho máximo
            if (valores[7].length() > 100) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), nomesColunas[7], nomesCampos[7], 
                    valores[7], "Excede o limite de 100 caracteres"));
            }
        }
        
        return erros;
    }

    /**
     * Encontra início dos dados para o NOVO FORMATO de tipos
     */
    private static int encontrarInicioDadosTiposNovoFormato(Sheet sheet) {
        // Procurar por "pk_tipo_funcionalidade" ou "designacao" nas primeiras linhas
        for (int i = 0; i <= Math.min(30, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                // Verificar se é a linha de cabeçalho da tabela
                Cell cell0 = row.getCell(0);
                Cell cell1 = row.getCell(1);
                
                if (cell0 != null && cell1 != null) {
                    String valor0 = FuncionsHelper.getCellAsString(cell0);
                    String valor1 = FuncionsHelper.getCellAsString(cell1);
                    
                    if (valor0 != null && valor1 != null) {
                        String val0Lower = valor0.trim().toLowerCase();
                        String val1Lower = valor1.trim().toLowerCase();
                        
                        // CORREÇÃO: Verificar se é o cabeçalho da tabela
                        // O cabeçalho deve conter "pk_tipo" e "designacao" nas duas colunas
                        if (val0Lower.contains("pk_tipo") && val1Lower.contains("designacao")) {
                            System.out.println("✅ Encontrado cabeçalho de tipos na linha: " + (i + 1));
                            System.out.println("   Coluna A: " + valor0);
                            System.out.println("   Coluna B: " + valor1);
                            
                            // Retornar a linha APÓS o cabeçalho
                            return i + 1;
                        }
                        
                        // Verificar se já são dados (números na primeira coluna)
                        try {
                            Integer.parseInt(valor0.trim());
                            // Se a primeira coluna é um número e a segunda não está vazia,
                            // provavelmente já é uma linha de dados
                            if (!valor1.trim().isEmpty() && !valor1.toLowerCase().contains("designacao")) {
                                System.out.println("⚠️ Início de dados encontrado na linha: " + (i + 1));
                                return i;
                            }
                        } catch (NumberFormatException e) {
                            // Não é número, continuar procurando
                        }
                    }
                }
            }
        }
        
        // Se não encontrou o cabeçalho, procurar diretamente por dados
        System.out.println("⚠️ Cabeçalho não encontrado, procurando por dados...");
        for (int i = 0; i <= Math.min(30, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell0 = row.getCell(0);
                if (cell0 != null) {
                    String valor0 = FuncionsHelper.getCellAsString(cell0);
                    if (valor0 != null) {
                        try {
                            Integer.parseInt(valor0.trim());
                            // Verificar se tem pelo menos uma coluna com dados
                            Cell cell1 = row.getCell(1);
                            if (cell1 != null) {
                                String valor1 = FuncionsHelper.getCellAsString(cell1);
                                if (valor1 != null && !valor1.trim().isEmpty()) {
                                    System.out.println("✅ Dados encontrados na linha: " + (i + 1));
                                    return i;
                                }
                            }
                        } catch (NumberFormatException e) {
                            // Não é número
                        }
                    }
                }
            }
        }
        
        System.out.println("❌ Não foi possível encontrar o início dos dados na folha de tipos");
        return -1;
    }

    /**
     * Encontra início dos dados para o NOVO FORMATO de funcionalidades
     */
    private static int encontrarInicioDadosFuncionalidadesNovoFormato(Sheet sheet) {
        // CORREÇÃO: Começar a busca a partir da linha 3 (índice 2) para funcionalidades
        // porque as linhas 1-2 são cabeçalho (nome, descricao, data)
        
        // Primeiro, procurar pelo cabeçalho da tabela a partir da linha 3
        for (int i = 2; i <= Math.min(20, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null && row.getLastCellNum() >= 8) {
                // Verificar colunas do cabeçalho
                List<String> cabecalhoEsperado = Arrays.asList(
                    "pk_funcionalidade", "designacao", "descricao", "fk_tipo_funcionalidade",
                    "grupo", "fk_funcionalidade", "funcionalidades_partilhadas", "url"
                );
                
                boolean match = true;
                for (int j = 0; j < cabecalhoEsperado.size(); j++) {
                    Cell cell = row.getCell(j);
                    if (cell != null) {
                        String valor = FuncionsHelper.getCellAsString(cell);
                        if (valor != null) {
                            String valorLower = valor.trim().toLowerCase();
                            String esperadoLower = cabecalhoEsperado.get(j).toLowerCase();
                            
                            if (!valorLower.contains(esperadoLower) && !esperadoLower.contains(valorLower)) {
                                match = false;
                                break;
                            }
                        } else {
                            match = false;
                            break;
                        }
                    } else {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    System.out.println("✅ Cabeçalho da tabela encontrado na linha: " + (i + 1));
                    return i + 1; // Retornar linha após o cabeçalho
                }
            }
        }
        
        // Alternativa: procurar por números na primeira coluna a partir da linha 3
        System.out.println("⚠️ Cabeçalho da tabela não encontrado, procurando por dados a partir da linha 3...");
        for (int i = 2; i <= Math.min(30, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row != null) {
                Cell cell0 = row.getCell(0);
                if (cell0 != null) {
                    String valor = FuncionsHelper.getCellAsString(cell0);
                    if (valor != null) {
                        try {
                            Integer.parseInt(valor.trim());
                            // Verificar se as próximas colunas têm dados
                            if (row.getCell(1) != null && 
                                !FuncionsHelper.getCellAsString(row.getCell(1)).trim().isEmpty()) {
                                System.out.println("✅ Dados encontrados na linha: " + (i + 1));
                                return i;
                            }
                        } catch (NumberFormatException e) {
                            // Não é número
                        }
                    }
                }
            }
        }
        
        System.out.println("❌ Não foi possível encontrar o início dos dados na folha de funcionalidades");
        return -1;
    }

    /**
     * Valida linha de tipo funcionalidade NOVO FORMATO
     */
    private static List<Map<String, Object>> validarLinhaTipoFuncionalidadeNovoFormato(Row row, int numeroLinha, Set<Integer> pksProcessados) {
        List<Map<String, Object>> erros = new ArrayList<>();
        int linhaReal = numeroLinha + 1;

        Cell cell0 = row.getCell(0); // pk_tipo_funcionalidade
        Cell cell1 = row.getCell(1); // designacao

        // CORREÇÃO: Verificar se é linha de cabeçalho e pular
        if (cell0 != null && cell1 != null) {
            String valor0 = FuncionsHelper.getCellAsString(cell0);
            String valor1 = FuncionsHelper.getCellAsString(cell1);
            
            if (valor0 != null && valor1 != null) {
                String val0Lower = valor0.trim().toLowerCase();
                String val1Lower = valor1.trim().toLowerCase();
                
                // Se for a linha de cabeçalho, retornar sem erros (será ignorada)
                if (val0Lower.contains("pk_tipo") && val1Lower.contains("designacao")) {
                    System.out.println("⚠️ Linha " + linhaReal + " é cabeçalho, ignorando...");
                    return erros; // Retorna lista vazia para ignorar esta linha
                }
            }
        }

        // Validação normal...
        if (cell0 == null || isCellEmpty(cell0)) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            try {
                String valorStr = FuncionsHelper.getCellAsString(cell0);
                if (valorStr == null || valorStr.trim().isEmpty()) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                        "[VAZIO]", "Não pode estar vazio"));
                } else {
                    valorStr = valorStr.trim();
                    
                    if (!valorStr.matches("\\d+")) {
                        if (valorStr.matches("\\d+\\.\\d+")) {
                            try {
                                double doubleValue = Double.parseDouble(valorStr);
                                if (doubleValue != Math.floor(doubleValue)) {
                                    erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                        valorStr, "Deve ser inteiro (sem casas decimais)"));
                                } else {
                                    int pkTipo = (int) doubleValue;
                                    if (pkTipo < 0) {
                                        erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                            valorStr, "Não pode ser negativo"));
                                    } else if (pkTipo > 0 && pksProcessados.contains(pkTipo)) {
                                        erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                            valorStr, "PK " + pkTipo + " duplicado neste arquivo"));
                                    }
                                }
                            } catch (NumberFormatException e) {
                                erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                    valorStr, "Deve ser um número válido"));
                            }
                        } else {
                            erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                valorStr, "Deve ser um NÚMERO INTEIRO"));
                        }
                    } else {
                        try {
                            int pkTipo = Integer.parseInt(valorStr);
                            if (pkTipo < 0) {
                                erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                    valorStr, "Não pode ser negativo"));
                            } else if (pkTipo > 0 && pksProcessados.contains(pkTipo)) {
                                erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                    valorStr, "PK " + pkTipo + " duplicado neste arquivo"));
                            }
                        } catch (NumberFormatException e) {
                            erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                                valorStr, "Erro ao converter para número"));
                        }
                    }
                }
            } catch (Exception e) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), "A", "pk_tipo_funcionalidade", 
                    "[ERRO LEITURA]", e.getMessage()));
            }
        }

        if (cell1 == null || isCellEmpty(cell1)) {
            erros.add(criarDetalheErro(String.valueOf(linhaReal), "B", "designacao", 
                "[VAZIO]", "Campo obrigatório não preenchido"));
        } else {
            try {
                String designacao = FuncionsHelper.getCellAsString(cell1);
                if (designacao == null || designacao.trim().isEmpty()) {
                    erros.add(criarDetalheErro(String.valueOf(linhaReal), "B", "designacao", 
                        "[VAZIO]", "Não pode estar vazia"));
                } else if ("designacao".equalsIgnoreCase(designacao.trim())) {
                    // CORREÇÃO: Não é mais erro, apenas ignorar cabeçalho
                    System.out.println("⚠️ Linha " + linhaReal + ", Coluna B (designacao): Texto de cabeçalho encontrado, ignorando linha...");
                    return new ArrayList<>(); // Retorna lista vazia para ignorar
                } else {
                    // Validar se contém apenas letras e caracteres permitidos (incluindo _ e /)
                    if (!LETTERS_ONLY_PATTERN.matcher(designacao).matches()) {
                        erros.add(criarDetalheErro(String.valueOf(linhaReal), "B", "designacao", 
                            designacao, "Deve conter apenas letras e caracteres especiais (.,;:?!\"'()_-/). Números não permitidos"));
                    }
                }
            } catch (Exception e) {
                erros.add(criarDetalheErro(String.valueOf(linhaReal), "B", "designacao", 
                    "[ERRO LEITURA]", "Erro ao ler - " + e.getMessage()));
            }
        }

        return erros;
    }

    /**
     * Processa linha de tipo funcionalidade NOVO FORMATO
     */
    private static TipoFuncionalidade processarLinhaTipoFuncionalidadeNovoFormato(Row row) {
        try {
            TipoFuncionalidade tipoFuncionalidade = new TipoFuncionalidade();
            
            Cell cell0 = row.getCell(0);
            if (cell0 != null) {
                int pkTipo = converterParaInteiro(cell0, "PK Tipo Funcionalidade");
                if (pkTipo >= 0) {
                    tipoFuncionalidade.setPkTipoFuncionalidade(pkTipo);
                } else {
                    throw new RuntimeException("PK Tipo Funcionalidade não pode ser negativo");
                }
            } else {
                throw new RuntimeException("PK Tipo Funcionalidade é obrigatório");
            }
            
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
     * Processa linha de funcionalidade NOVO FORMATO
     */
    private static FuncionalidadeData processarLinhaFuncionalidadeDataNovoFormato(Row row) {
        try {
            Function<Cell, Integer> getIntValue = (cell) -> {
                if (cell == null) return 0;
                
                String cellValue = FuncionsHelper.getCellAsString(cell);
                if (cellValue == null || cellValue.trim().isEmpty()) return 0;
                
                cellValue = cellValue.trim();
                
                try {
                    return Integer.parseInt(cellValue);
                } catch (NumberFormatException e1) {
                    try {
                        double doubleValue = Double.parseDouble(cellValue);
                        if (doubleValue != Math.floor(doubleValue)) {
                            throw new RuntimeException("Valor deve ser inteiro, sem casas decimais: '" + cellValue + "'");
                        }
                        return (int) doubleValue;
                    } catch (NumberFormatException e2) {
                        throw new RuntimeException("Valor deve ser um número inteiro: '" + cellValue + "'");
                    }
                }
            };

            Function<Cell, String> getStringValue = (cell) -> {
                if (cell == null) return "";
                return FuncionsHelper.getCellAsString(cell);
            };

            // pk_funcionalidade (coluna 0)
            Integer pkFuncionalidade = null;
            Cell cell0 = row.getCell(0);
            if (cell0 != null) {
                String valorPkStr = getStringValue.apply(cell0);
                if (valorPkStr != null && !valorPkStr.trim().isEmpty()) {
                    valorPkStr = valorPkStr.trim();
                    
                    if (!valorPkStr.matches("\\d+")) {
                        if (valorPkStr.matches("\\d+\\.\\d+")) {
                            double doubleValue = Double.parseDouble(valorPkStr);
                            if (doubleValue != Math.floor(doubleValue)) {
                                throw new RuntimeException("Coluna A: PK Funcionalidade deve ser inteiro (sem casas decimais). Valor: '" + valorPkStr + "'");
                            }
                            pkFuncionalidade = (int) doubleValue;
                        } else {
                            throw new RuntimeException("Coluna A: PK Funcionalidade deve ser um número inteiro. Valor inválido: '" + valorPkStr + "'");
                        }
                    } else {
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
            
            // designacao (coluna 1)
            String designacao = getStringValue.apply(row.getCell(1));
            if (designacao == null || designacao.trim().isEmpty()) {
                throw new RuntimeException("Coluna B: Designação não pode estar vazia");
            }
            
            // descricao (coluna 2)
            String descricao = getStringValue.apply(row.getCell(2));
            if (descricao == null || descricao.trim().isEmpty()) {
                throw new RuntimeException("Coluna C: Descrição não pode estar vazia");
            }
            
            // fk_tipo_funcionalidade (coluna 3)
            Integer fkTipo = getIntValue.apply(row.getCell(3));
            if (fkTipo <= 0) {
                throw new RuntimeException("Coluna D: FK Tipo Funcionalidade deve ser maior que 0");
            }
            
            // grupo (coluna 4)
            Integer grupo = getIntValue.apply(row.getCell(4));
            
            // fk_funcionalidade (coluna 5) - OPCIONAL
            Integer fkFuncionalidade = null;
            Cell cell5 = row.getCell(5);
            if (cell5 != null && !isCellEmpty(cell5)) {
                String fkFuncStr = getStringValue.apply(cell5);
                if (fkFuncStr != null && !fkFuncStr.trim().isEmpty()) {
                    fkFuncStr = fkFuncStr.trim();
                    if (!fkFuncStr.matches("\\d+")) {
                        if (fkFuncStr.equals("0")) {
                            fkFuncionalidade = 0;
                        } else {
                            throw new RuntimeException("Coluna F: FK Funcionalidade deve ser um número inteiro. Valor: '" + fkFuncStr + "'");
                        }
                    } else {
                        fkFuncionalidade = Integer.parseInt(fkFuncStr);
                        if (fkFuncionalidade == 0) {
                            fkFuncionalidade = null;
                        }
                    }
                }
            }

            // funcionalidades_partilhadas (coluna 6) - OPCIONAL
            String funcionalidadesPartilhadas = null;
            Cell cell6 = row.getCell(6);
            if (cell6 != null && !isCellEmpty(cell6)) {
                String partilhadas = getStringValue.apply(cell6);
                if (partilhadas != null && !partilhadas.trim().isEmpty()) {
                    // Aceitar "1000" ou "1000;" como valor válido
                    String trimmed = partilhadas.trim();
                    if (trimmed.equals("1000") || trimmed.equals("1000;") || SHARED_FUNCS_PATTERN.matcher(trimmed).matches()) {
                        funcionalidadesPartilhadas = trimmed;
                    } else {
                        throw new RuntimeException("Coluna G: Funcionalidades Partilhadas deve ser '1000', '1000;' ou números inteiros separados por ponto e vírgula. Valor: '" + partilhadas + "'");
                    }
                }
            }

            // url (coluna 7) - OPCIONAL
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

    // Classes auxiliares e métodos auxiliares
    
    private static class FuncionalidadeData {
        Integer pkFuncionalidade;
        String designacao;
        String descricao;
        Integer fkTipoFuncionalidade;
        Integer grupo;
        Integer fkFuncionalidade;
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

    private static List<FuncionalidadeData> ordenarPorDependencia(List<FuncionalidadeData> funcionalidades) {
        Map<Integer, List<Integer>> dependencias = new HashMap<>();
        Map<Integer, FuncionalidadeData> funcionalidadesMap = new HashMap<>();
        
        for (FuncionalidadeData func : funcionalidades) {
            funcionalidadesMap.put(func.pkFuncionalidade, func);
            
            if (func.fkFuncionalidade != null && func.fkFuncionalidade > 0) {
                dependencias.computeIfAbsent(func.pkFuncionalidade, k -> new ArrayList<>())
                           .add(func.fkFuncionalidade);
            }
        }
        
        List<FuncionalidadeData> ordenadas = new ArrayList<>();
        Set<Integer> processados = new HashSet<>();
        
        // Adicionar primeiro os que não têm dependências
        for (FuncionalidadeData func : funcionalidades) {
            if (func.fkFuncionalidade == null || func.fkFuncionalidade <= 0 || 
                !funcionalidadesMap.containsKey(func.fkFuncionalidade)) {
                ordenadas.add(func);
                processados.add(func.pkFuncionalidade);
            }
        }
        
        // Processar os restantes
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
        
        // Adicionar quaisquer restantes (possível ciclo)
        for (FuncionalidadeData func : funcionalidades) {
            if (!processados.contains(func.pkFuncionalidade)) {
                ordenadas.add(func);
                processados.add(func.pkFuncionalidade);
            }
        }
        
        return ordenadas;
    }

    private static int converterParaInteiro(Cell cell, String nomeCampo) {
        if (cell == null) {
            throw new RuntimeException(nomeCampo + " não pode ser nulo");
        }
        
        try {
            String stringValue = FuncionsHelper.getCellAsString(cell);
            if (stringValue == null || stringValue.trim().isEmpty()) {
                throw new RuntimeException(nomeCampo + " não pode estar vazio");
            }
            
            stringValue = stringValue.trim();
            
            if (!stringValue.matches("\\d+")) {
                if (stringValue.matches("\\d+\\.\\d+")) {
                    double doubleValue = Double.parseDouble(stringValue);
                    if (doubleValue != Math.floor(doubleValue)) {
                        throw new RuntimeException(nomeCampo + " deve ser inteiro, sem casas decimais. Valor: '" + stringValue + "'");
                    }
                    return (int) doubleValue;
                } else {
                    throw new RuntimeException(nomeCampo + " deve ser um número inteiro. Valor inválido: '" + stringValue + "'");
                }
            }
            
            int valor = Integer.parseInt(stringValue);
            if (valor < 0) {
                throw new RuntimeException(nomeCampo + " não pode ser negativo");
            }
            return valor;
            
        } catch (Exception e) {
            throw new RuntimeException(nomeCampo + " - " + e.getMessage());
        }
    }

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

    private static boolean isCellEmpty(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return true;
        }
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim().isEmpty();
        }
        return false;
    }

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
