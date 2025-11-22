package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.entities.TipoFuncionalidade;
import com.ucan.plataformadenuncias.repositories.FuncionalidadeRepository;
import com.ucan.plataformadenuncias.repositories.TipoFuncionalidadeRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.ucan.plataformadenuncias.config.FuncionsHelper;

import java.io.InputStream;

public class TipoFuncionalidadeLoader {

    /**
     *
     * @param file
     * @param tipoFuncionalidadeRepository
     * @return
     */
    public static Object insertTipoFuncionalidadeIntoTable(MultipartFile file, TipoFuncionalidadeRepository tipoFuncionalidadeRepository)
    {
        System.out.println(file);

        if (file.isEmpty()) {
            return null;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(1);

            System.out.println("=== LENDO FICHEIRO EXCEL ===");
            int index = 5;

            while (index <= sheet.getLastRowNum()) {

                Row row = sheet.getRow(index);
                if (row == null) {
                    index++;
                    continue;
                }

                TipoFuncionalidade tipoFuncionalidade = new TipoFuncionalidade();

           //     String auxPkFuncionalidade = FuncionsHelper.getCellAsString(row.getCell(0));

                tipoFuncionalidade.setPkTipoFuncionalidade(
                        Integer.parseInt(FuncionsHelper.getCellAsString(row.getCell(0)))
                );

                tipoFuncionalidade.setDesignacao(FuncionsHelper.getCellAsString(row.getCell(1)));

                tipoFuncionalidadeRepository.save(tipoFuncionalidade);

                index++;
            }

            System.out.println("=== FIM DA LEITURA ===");

            return ResponseEntity.ok("Ficheiro recebido com sucesso!");

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     *
     * @param file
     * @param funcionalidadeRepository
     * @return
     */
    public static Object insertFuncionalidadeIntoTable(MultipartFile file, FuncionalidadeRepository funcionalidadeRepository)
    {
        System.out.println(file);

        if (file.isEmpty()) {
            return null;
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0); // Primeira folha

            System.out.println("=== INÍCIO CABEÇALHO ===");
            System.out.println("nome : " + FuncionsHelper.getCellAsString(sheet.getRow(0).getCell(1)));
            System.out.println("descricao :" + FuncionsHelper.getCellAsString(sheet.getRow(1).getCell(1)));
            System.out.println("data: " + FuncionsHelper.getCellAsString(sheet.getRow(2).getCell(1)));
            System.out.println("=== FÍM CABEÇALHO ===");

            System.out.println("=== LENDO FICHEIRO EXCEL ===");
            int index = 5;

            while (index <= sheet.getLastRowNum()) {

                Row row = sheet.getRow(index);
                if (row == null) {
                    index++;
                    continue;
                }

                Funcionalidade funcionalidade = new Funcionalidade();

                funcionalidade.setPkFuncionalidade( (int)row.getCell(0).getNumericCellValue() );
                funcionalidade.setDesignacao( row.getCell(1).getStringCellValue());
                funcionalidade.setDescricao(row.getCell(2).getStringCellValue());
                funcionalidade.setFkTipoFuncionalidade(new TipoFuncionalidade((int)row.getCell(3).getNumericCellValue()));
                funcionalidade.setGrupo( (int)row.getCell(4).getNumericCellValue());
                funcionalidade.setFkFuncionalidade( new Funcionalidade( (int) row.getCell(5).getNumericCellValue()));
                funcionalidade.setFuncionalidadesPartilhadas( row.getCell(6).getStringCellValue());
                funcionalidade.setUrl(FuncionsHelper.getCellAsString(row.getCell(7)));

                funcionalidadeRepository.save(funcionalidade);

                System.out.println("ID"+row.getCell(0).getNumericCellValue());
                System.out.print("Descricao: "+ row.getCell(1).getStringCellValue());
                System.out.print("Designcao" + row.getCell(2).getStringCellValue());
                System.out.print("fk_tipo_funcionalidade" + row.getCell(3).getNumericCellValue());
                System.out.print("grupo" + row.getCell(4).getNumericCellValue());
                System.out.print("fk_funcionalidade" + row.getCell(5).getNumericCellValue());
                System.out.print("funcionalidades_partilhadas " + row.getCell(6).getStringCellValue());
                System.out.println("url" + row.getCell(7).getStringCellValue());

                index++;

            }

            System.out.println("=== FIM DA LEITURA ===");

            return ResponseEntity.ok("Ficheiro recebido com sucesso!");

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

}
