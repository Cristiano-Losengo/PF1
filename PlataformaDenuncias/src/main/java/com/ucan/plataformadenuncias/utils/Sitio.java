
package com.ucan.plataformadenuncias.utils;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author cristiano
 */
@Getter
@Setter
public class Sitio implements Serializable {

    private String nome, pai, avo;

    // Construtores
    public Sitio() {
    }

    public Sitio(String nome) {
        this.nome = nome;
    }

    public Sitio(String nome, String pai) {
        this.nome = nome;
        this.pai = pai;
    }

    public Sitio(String nome, String pai, String avo) {
        this.nome = nome;
        this.pai = pai;
        this.avo = avo;
    }

}
