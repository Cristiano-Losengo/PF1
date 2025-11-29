package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.entities.TipoFuncionalidade;
import com.ucan.plataformadenuncias.repositories.FuncionalidadeRepository;
import com.ucan.plataformadenuncias.repositories.TipoFuncionalidadeRepository;
import com.ucan.plataformadenuncias.services.VersaoService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class TipoFuncionalidadeLoader {

    /**
     * Valida e insere tipos de funcionalidade com validações
     */
    public static List<String> insertTipoFuncionalidadeIntoTable(
            MultipartFile file, TipoFuncionalidadeRepository tipoFuncionalidadeRepository) {
        
        List<String> erros = new ArrayList<>();

        if (file.isEmpty()) {
            erros.add("Ficheiro está vazio");
            return erros;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(1); // Segunda folha para tipos
            if (sheet == null) {
                erros.add("Folha de tipos de funcionalidade não encontrada");
                return erros;
            }

            System.out.println("=== VALIDANDO TIPOS DE FUNCIONALIDADE ===");
            
            // Encontra a linha onde começam os dados
            int startIndex = encontrarInicioDadosTipos(sheet);
            if (startIndex == -1) {
                erros.add("Não foi possível encontrar o início dos dados na folha de tipos");
                return erros;
            }

            System.out.println("Iniciando leitura na linha: " + (startIndex + 1));

            int index = startIndex;
            int linhasProcessadas = 0;
            int linhasComErro = 0;

            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                if (row == null || isEmptyRow(row)) {
                    index++;
                    continue;
                }

                // Validação da linha
                List<String> errosLinha = validarLinhaTipoFuncionalidade(row, index);
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    linhasComErro++;
                    index++;
                    continue;
                }

                try {
                    // Processa a linha válida
                    TipoFuncionalidade tipoFuncionalidade = processarLinhaTipoFuncionalidade(row);
                    if (tipoFuncionalidade != null) {
                        tipoFuncionalidadeRepository.save(tipoFuncionalidade);
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

        } catch (Exception e) {
            erros.add("❌ Erro ao ler ficheiro: " + e.getMessage());
            e.printStackTrace();
        }

        return erros;
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
                        if (num > 0) {
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
            
            // Coluna 0 - pk_tipo_funcionalidade
            Cell cell0 = row.getCell(0);
            if (cell0 != null) {
                int pkTipo = converterParaInteiro(cell0, "PK Tipo Funcionalidade");
                if (pkTipo > 0) {
                    tipoFuncionalidade.setPkTipoFuncionalidade(pkTipo);
                } else {
                    throw new RuntimeException("PK Tipo Funcionalidade deve ser maior que 0");
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
            
            // Remove caracteres não numéricos
            String apenasNumeros = stringValue.replaceAll("[^0-9]", "");
            if (apenasNumeros.isEmpty()) {
                throw new RuntimeException(nomeCampo + " deve ser numérico. Valor encontrado: '" + stringValue + "'");
            }
            
            try {
                int valor = Integer.parseInt(apenasNumeros);
                if (valor <= 0) {
                    throw new RuntimeException(nomeCampo + " deve ser maior que 0");
                }
                return valor;
            } catch (NumberFormatException e) {
                throw new RuntimeException(nomeCampo + " deve ser um número inteiro válido. Valor encontrado: '" + stringValue + "'");
            }
            
        } catch (Exception e) {
            throw new RuntimeException(nomeCampo + " - " + e.getMessage());
        }
    }

    /**
     * Valida e insere funcionalidades com validações completas
     */
    public static List<String> insertFuncionalidadeIntoTable(
            MultipartFile file, FuncionalidadeRepository funcionalidadeRepository, VersaoService versaoService) {
        
        List<String> erros = new ArrayList<>();

        if (file.isEmpty()) {
            erros.add("❌ Ficheiro está vazio");
            return erros;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0); // Primeira folha

            // Validação do cabeçalho
            System.out.println("=== VALIDANDO CABEÇALHO ===");
            String nome = FuncionsHelper.getCellAsString(sheet.getRow(0).getCell(1));
            String descricao = FuncionsHelper.getCellAsString(sheet.getRow(1).getCell(1));
            String data = FuncionsHelper.getCellAsString(sheet.getRow(2).getCell(1));

            if (nome == null || nome.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 1, coluna B): Nome não pode estar vazio");
            }
            if (descricao == null || descricao.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 2, coluna B): Descrição não pode estar vazia");
            }
            if (data == null || data.isEmpty()) {
                erros.add("❌ Cabeçalho (linha 3, coluna B): Data não pode estar vazia");
            }

            if (!erros.isEmpty()) {
                return erros;
            }

            String[] arrayVersao = data.split("-");
            
            System.out.println("=== INÍCIO VALIDAÇÃO FUNCIONALIDADES ===");
            int index = 5; // Começa na linha 6 (0-based)
            int linhasProcessadas = 0;
            int linhasComErro = 0;

            while (index <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(index);
                if (row == null) {
                    index++;
                    continue;
                }

                // Validação completa da linha
                List<String> errosLinha = validarLinhaFuncionalidade(row, index);
                
                if (!errosLinha.isEmpty()) {
                    erros.addAll(errosLinha);
                    linhasComErro++;
                    index++;
                    continue;
                }

                try {
                    // Processamento da linha válida
                    Funcionalidade funcionalidade = processarLinhaFuncionalidade(row);
                    
                    if (funcionalidade != null) {
                        funcionalidadeRepository.save(funcionalidade);
                        linhasProcessadas++;
                    }
                    
                } catch (Exception e) {
                    erros.add("❌ Linha " + (index + 1) + ": Erro ao processar - " + e.getMessage());
                    linhasComErro++;
                }
                
                index++;
            }

            System.out.println("=== FIM DA VALIDAÇÃO ===");
            System.out.println("Linhas processadas com sucesso: " + linhasProcessadas);
            System.out.println("Linhas com erro: " + linhasComErro);

        } catch (Exception e) {
            erros.add("❌ Erro ao ler ficheiro: " + e.getMessage());
        }

        return erros;
    }

    /**
     * Valida uma linha completa de tipo de funcionalidade
     */
    private static List<String> validarLinhaTipoFuncionalidade(Row row, int numeroLinha) {
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
                    int pkTipo = converterParaInteiro(cell0, "PK Tipo Funcionalidade");
                    if (pkTipo <= 0) {
                        erros.add("❌ Linha " + linhaReal + ", Coluna A (pk_tipo_funcionalidade): Deve ser maior que 0");
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
     * Valida uma linha completa de funcionalidade
     */
    private static List<String> validarLinhaFuncionalidade(Row row, int numeroLinha) {
        List<String> erros = new ArrayList<>();
        int linhaReal = numeroLinha + 1;

        // Função auxiliar para validar células numéricas
        Function<Cell, Double> getNumericValue = (cell) -> {
            return FuncionsHelper.getCellAsDouble(cell);
        };

        // Coluna 0 - pkFuncionalidade (obrigatório, inteiro)
        Cell cell0 = row.getCell(0);
        Double valorPk = getNumericValue.apply(cell0);
        if (valorPk == null) {
            String valorAtual = cell0 != null ? "Valor atual: '" + FuncionsHelper.getCellAsString(cell0) + "'" : "Célula vazia";
            erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser numérico. " + valorAtual);
        } else {
            if (valorPk <= 0) {
                erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser maior que 0");
            } else if (valorPk != Math.floor(valorPk)) {
                erros.add("❌ Linha " + linhaReal + ", Coluna A (pkFuncionalidade): Deve ser inteiro (sem casas decimais)");
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
        Double valorFkTipo = getNumericValue.apply(cell3);
        if (valorFkTipo == null) {
            String valorAtual = cell3 != null ? "Valor atual: '" + FuncionsHelper.getCellAsString(cell3) + "'" : "Célula vazia";
            erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser numérico. " + valorAtual);
        } else {
            if (valorFkTipo <= 0) {
                erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser maior que 0");
            } else if (valorFkTipo != Math.floor(valorFkTipo)) {
                erros.add("❌ Linha " + linhaReal + ", Coluna D (fkTipoFuncionalidade): Deve ser inteiro (sem casas decimais)");
            }
        }

        // Coluna 4 - grupo (obrigatório, inteiro)
        Cell cell4 = row.getCell(4);
        Double valorGrupo = getNumericValue.apply(cell4);
        if (valorGrupo == null) {
            String valorAtual = cell4 != null ? "Valor atual: '" + FuncionsHelper.getCellAsString(cell4) + "'" : "Célula vazia";
            erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser numérico. " + valorAtual);
        } else {
            if (valorGrupo < 0) {
                erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser não negativo");
            } else if (valorGrupo != Math.floor(valorGrupo)) {
                erros.add("❌ Linha " + linhaReal + ", Coluna E (grupo): Deve ser inteiro (sem casas decimais)");
            }
        }

        // Coluna 5 - fkFuncionalidade (opcional, inteiro)
        Cell cell5 = row.getCell(5);
        if (cell5 != null && !isCellEmpty(cell5)) {
            Double valorFkFunc = getNumericValue.apply(cell5);
            if (valorFkFunc == null) {
                String valorAtual = "Valor atual: '" + FuncionsHelper.getCellAsString(cell5) + "'";
                erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser numérico. " + valorAtual);
            } else {
                if (valorFkFunc < 0) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser não negativo");
                } else if (valorFkFunc != Math.floor(valorFkFunc)) {
                    erros.add("❌ Linha " + linhaReal + ", Coluna F (fkFuncionalidade): Deve ser inteiro (sem casas decimais)");
                }
            }
        }

        // Coluna 6 - funcionalidadesPartilhadas (opcional, string)
        Cell cell6 = row.getCell(6);
        if (cell6 != null && !isCellEmpty(cell6)) {
            String partilhadas = FuncionsHelper.getCellAsString(cell6);
            // Validação adicional de formato se necessário
            if (partilhadas != null && partilhadas.length() > 250) {
                erros.add("❌ Linha " + linhaReal + ", Coluna G (funcionalidadesPartilhadas): Excede o limite de 250 caracteres");
            }
        }

        // Coluna 7 - url (opcional, string)
        Cell cell7 = row.getCell(7);
        if (cell7 != null && !isCellEmpty(cell7)) {
            String url = FuncionsHelper.getCellAsString(cell7);
            // Validação adicional de formato se necessário
            if (url != null && url.length() > 100) {
                erros.add("❌ Linha " + linhaReal + ", Coluna H (url): Excede o limite de 100 caracteres");
            }
        }

        return erros;
    }

    /**
     * Processa uma linha válida de funcionalidade
     */
    private static Funcionalidade processarLinhaFuncionalidade(Row row) {
        Funcionalidade funcionalidade = new Funcionalidade();

        try {
            // Função auxiliar para obter valores inteiros
            Function<Cell, Integer> getIntValue = (cell) -> {
                if (cell == null) return 0;
                Double value = FuncionsHelper.getCellAsDouble(cell);
                return value != null ? value.intValue() : 0;
            };

            // pkFuncionalidade
            Integer pkFuncionalidade = getIntValue.apply(row.getCell(0));
            if (pkFuncionalidade > 0) {
                funcionalidade.setPkFuncionalidade(pkFuncionalidade);
            } else {
                throw new RuntimeException("Coluna A: PK Funcionalidade inválido");
            }
            
            // designacao
            Cell cell1 = row.getCell(1);
            if (cell1 != null) {
                String designacao = FuncionsHelper.getCellAsString(cell1);
                if (designacao != null && !designacao.trim().isEmpty()) {
                    funcionalidade.setDesignacao(designacao.trim());
                } else {
                    throw new RuntimeException("Coluna B: Designação não pode estar vazia");
                }
            } else {
                throw new RuntimeException("Coluna B: Designação é obrigatória");
            }
            
            // descricao
            Cell cell2 = row.getCell(2);
            if (cell2 != null) {
                String descricao = FuncionsHelper.getCellAsString(cell2);
                if (descricao != null && !descricao.trim().isEmpty()) {
                    funcionalidade.setDescricao(descricao.trim());
                } else {
                    throw new RuntimeException("Coluna C: Descrição não pode estar vazia");
                }
            } else {
                throw new RuntimeException("Coluna C: Descrição é obrigatória");
            }
            
            // fkTipoFuncionalidade
            Integer fkTipo = getIntValue.apply(row.getCell(3));
            if (fkTipo > 0) {
                funcionalidade.setFkTipoFuncionalidade(new TipoFuncionalidade(fkTipo));
            } else {
                throw new RuntimeException("Coluna D: FK Tipo Funcionalidade inválido");
            }
            
            // grupo
            Integer grupo = getIntValue.apply(row.getCell(4));
            funcionalidade.setGrupo(grupo);

            // fkFuncionalidade (opcional)
            Cell cell5 = row.getCell(5);
            if (cell5 != null && !isCellEmpty(cell5)) {
                Integer fkFunc = getIntValue.apply(cell5);
                if (fkFunc != 0) {
                    funcionalidade.setFkFuncionalidade(new Funcionalidade(fkFunc));
                }
            }

            // funcionalidadesPartilhadas (opcional)
            Cell cell6 = row.getCell(6);
            if (cell6 != null && !isCellEmpty(cell6)) {
                String partilhadas = FuncionsHelper.getCellAsString(cell6);
                if (partilhadas != null && !partilhadas.trim().isEmpty()) {
                    funcionalidade.setFuncionalidadesPartilhadas(partilhadas.trim());
                }
            }

            // url (opcional)
            Cell cell7 = row.getCell(7);
            if (cell7 != null && !isCellEmpty(cell7)) {
                String url = FuncionsHelper.getCellAsString(cell7);
                if (url != null && !url.trim().isEmpty()) {
                    funcionalidade.setUrl(url.trim());
                }
            }

            return funcionalidade;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar linha: " + e.getMessage(), e);
        }
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
