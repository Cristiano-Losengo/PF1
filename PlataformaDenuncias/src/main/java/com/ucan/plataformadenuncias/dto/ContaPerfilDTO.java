package com.ucan.plataformadenuncias.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContaPerfilDTO {

    private String tipoConta;
    private String nomeCompleto;
    private String dataNascimento;
    private int fkGenero;
    private int fkEstadoCivil;
    private String identificacao;
    private String telefone;

    private String email;
    private String passwordHash;

    private int fkConta;
    private int fkPerfil;
    private int fkMunicipio;
    private int estado = 1;

    @Override
    public String toString() {
        return "ContaPerfilDTO{" + "tipoConta=" + tipoConta + ", nomeCompleto=" + nomeCompleto + ", dataNascimento=" + dataNascimento + ", sexo=" + fkGenero + ", estadoCivil=" + fkEstadoCivil + ", identificacao=" + identificacao + ", telefone=" + telefone + ", email=" + email + ", passwordHash=" + passwordHash + ", fkConta=" + fkConta + ", fkPerfil=" + fkPerfil + ", fkMunicipio=" + fkMunicipio + ", estado=" + estado + '}';
    }
    
    
}
