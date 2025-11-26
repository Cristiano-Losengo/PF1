package com.ucan.plataformadenuncias.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContaPerfilDTO {

    private int tipoConta;
    private String nomeCompleto;
    private String email;
    private String senha;
    private int fkPessoa;
    private int fkConta;
    private int fkPerfil;
    private boolean estado = true;

}
