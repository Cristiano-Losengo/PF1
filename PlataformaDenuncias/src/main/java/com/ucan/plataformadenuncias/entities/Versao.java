package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.Date;

@Entity
public class Versao {

    @Id
    private String designacao;
    private Date data;

    public Versao() {
    }

    public Versao(String designacao, Date data) {
        this.designacao = designacao;
        this.data = data;
    }

    // Getters and Setters

    public String getDesignacao() {
        return designacao;
    }

    public void setDesignacao(String designacao) {
        this.designacao = designacao;
    }

    public Date getData() {
        return data;
    }

    public void setData(Date data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "Versao{" +
                ", designacao='" + designacao + '\'' +
                ", data=" + data +
                '}';
    }

}
