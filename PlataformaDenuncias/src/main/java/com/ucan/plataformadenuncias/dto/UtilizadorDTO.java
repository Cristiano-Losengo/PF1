package com.ucan.plataformadenuncias.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UtilizadorDTO {

    private int pkUtilizador;
    private int fkPessoa;
    private int fkConta;
    //Pessoa campos
    private String nome;

    private String nomeConta;

    private LocalDate dataNascimento;

    private String identificacao;

    //utilizador campos
    private String detalhes;

    private LocalDateTime createdAt;

    private String username;

    private String email;

    private String telefone;

    private String password;

    private Boolean ativo = true;

    private String nivelAcesso;

    @Override
    public String toString() {

        return "UtilizadorDTO{" +
                "pkUtilizador=" + pkUtilizador +
                ", fkPessoa=" + fkPessoa +
                ", fkConta=" + fkConta +
                ", nomePessoa='" + nome + '\'' +
                ", nomeConta='" + nomeConta + '\'' +
                ", dataNascimento=" + dataNascimento +
                ", identificacao='" + identificacao + '\'' +
                ", detalhes='" + detalhes + '\'' +
                ", createdAt=" + createdAt +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", telefone='" + telefone + '\'' +
                ", password='" + password + '\'' +
                ", ativo=" + ativo +
                ", nivelAcesso='" + nivelAcesso + '\'' +
                '}';
    }
}
