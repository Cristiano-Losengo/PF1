package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 *
 * @author cristiano
 */
@Entity
@Table(name = "comentario")
public class Comentario {
    @Id @GeneratedValue
    @Column(name = "pk_comentario")
    private Integer pkComentario;
    private String texto;

    @ManyToOne
    @JoinColumn(name = "fk_denuncia", referencedColumnName = "pk_denuncia")
    //@JoinColumn(name = "fk_denuncia")
     private Denuncia fkDenuncia;
    
    @ManyToOne
    @JoinColumn(name = "fk_utilizador", referencedColumnName = "pk_utilizador")
    private Utilizador fkUtilizador;
    
    
}
