package com.ucan.plataformadenuncias.dto;

import com.ucan.plataformadenuncias.entities.Localidade;
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
    private String detalhes;
    private LocalDateTime createdAt;
     private LocalDateTime updatedAt;
    private String username;
    private Boolean ativo = true;

    //Pessoa campos
    private String nome;

    private String nomeConta;

    private LocalDate dataNascimento;

    private String identificacao;
     private Localidade localidade;

   


  

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
               
                ", ativo=" + ativo +
                '}';
    }
}
