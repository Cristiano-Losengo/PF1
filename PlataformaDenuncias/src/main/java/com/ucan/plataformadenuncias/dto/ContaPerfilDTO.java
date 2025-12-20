package com.ucan.plataformadenuncias.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContaPerfilDTO {

    private String tipoConta;
    private String nomeCompleto;
    private String email;
    private String senha;
    private String designacaoPerfil;
   // private int fkPessoa;
    private int fkConta;
    private int fkPerfil;
    private boolean estado = true;
    //private int fkPessoa;

}
