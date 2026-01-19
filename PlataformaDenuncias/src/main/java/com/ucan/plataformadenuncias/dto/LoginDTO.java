package com.ucan.plataformadenuncias.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class LoginDTO {

    private String username;
    private String password;

    private String nomeCompleto;
    private String tipoConta;
    private List<String> perfis;
    private List<String> funcionalidades;

    /**
     *  Conta - Perfil
     *  Funcionalidade - Perfil
     *  Conta - Perfil - Funcionalidade
     *
     *  Conta -> ContaPerfil -> Perfis -> FuncionalidadePerfil -> Funcionalidades
     *
     */

}
