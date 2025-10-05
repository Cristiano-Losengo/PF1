package com.ucan.plataformadenuncias.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaDTO {

    //Pessoa campos
    private String username;
    private String senha;
    private int fkPessoa;

    public String getUsername() {
        return username;
    }

    public String getSenha() {
        return senha;
    }

    public int getFkPessoa() {
        return fkPessoa;
    }
}
