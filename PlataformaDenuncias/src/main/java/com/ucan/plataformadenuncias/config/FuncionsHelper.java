package com.ucan.plataformadenuncias.config;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;

public class FuncionsHelper {

    /**
     *
     * @param cell
     * @return
     */
    public static String getCellAsString(Cell cell) {
        if (cell == null) return null;

        CellType type = cell.getCellType();

        if (type == CellType.FORMULA) {
            type = cell.getCachedFormulaResultType();
        }

        switch (type) {

            case STRING:
                return cell.getStringCellValue();

            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            case BLANK:
                return null;

            default:
                return null;
        }

    }


}
