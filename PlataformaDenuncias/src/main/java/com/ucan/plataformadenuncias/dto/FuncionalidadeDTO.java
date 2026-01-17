package com.ucan.plataformadenuncias.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FuncionalidadeDTO {

    private Integer pkFuncionalidade;

    private String descricao;

    private String designacao;

    private Integer fkTipoFuncionalidade;
    private String designacaoTipoFuncionalidade;

    private Integer grupo;

    private Integer fkFuncionalidadePai;

    private String funcionalidadesPartilhadas;

    private String url;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
