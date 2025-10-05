/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 *
 * @author cristiano
 */
// Resposta.java
@Entity
@Table(name = "resposta")
public class Resposta {
    @Id @GeneratedValue
     @Column(name = "pk_resposta")
    private Long pkResposta;
    
    private String texto;


    
    @ManyToOne
    @JoinColumn(name = "fk_denuncia", referencedColumnName = "pk_denuncia")
    private Denuncia denuncia;
    
    @ManyToOne
    @JoinColumn(name = "fk_utilizador", referencedColumnName = "pk_utilizador")
    private Utilizador utilizador;
    
    
}
