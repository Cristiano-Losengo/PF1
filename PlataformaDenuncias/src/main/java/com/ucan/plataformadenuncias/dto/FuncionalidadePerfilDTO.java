package com.ucan.plataformadenuncias.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FuncionalidadePerfilDTO {

    private int fkFuncionalidade;
    private int fkPerfil;
    private String detalhe;
    private String anexo;
    private String nomePerfil;
    private String nomeFuncionalidade;
    private String tipoFuncionalidade;
    private String detalhePerfil;
    private String detalheFuncionalidade;
    private String paiFuncionalidade;

}
