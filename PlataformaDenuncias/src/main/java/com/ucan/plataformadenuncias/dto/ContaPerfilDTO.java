package com.ucan.plataformadenuncias.dto;

public class ContaPerfilDTO {

    //Pessoa campos
    private int fkConta;
    private int fkPerfil;
    private boolean status = true;

    public int getFkConta() {
        return fkConta;
    }

    public int getFkPerfil() {
        return fkPerfil;
    }

    public boolean isStatus() {
        return status;
    }
}
