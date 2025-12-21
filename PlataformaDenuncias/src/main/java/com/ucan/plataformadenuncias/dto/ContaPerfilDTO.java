package com.ucan.plataformadenuncias.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContaPerfilDTO {

    private String nomeCompleto;
    private String dataNascimento;
    private String genero;
    private String estadoCivil;
    private String bilheteIdentidade;
    private String telefone;
    private String provincia;
    private String municipio;
    // Dados da Conta
    private String passwordHash;
    private String tipoConta;
    private String email;
    private int fkConta;
    private int fkPerfil;
    private int estado;

}
