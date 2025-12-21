package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;

/**
 *
 * @author cristiano
 */
@Entity
@Table(name = "comentario")
public class Comentario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_comentario")
    private Integer pkComentario;
    private String texto;

    @ManyToOne
    @JoinColumn(name = "fk_denuncia", referencedColumnName = "pk_denuncia")
    //@JoinColumn(name = "fk_denuncia")
     private Denuncia fkDenuncia;
    
    @ManyToOne
    @JoinColumn(name = "fk_pessoa", referencedColumnName = "pk_pessoa")
    private Pessoa fkPessoa;

}
