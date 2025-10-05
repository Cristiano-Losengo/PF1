package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;


/**
 *
 * @author cristiano
 */
@Entity
@Table(name = "estatistica")
public class Estatistica {
    @Id @GeneratedValue
    @Column(name = "pk_estatistica")
    private Integer pkEstatistica;
    
    
    
    @NotNull(message = "O total de Denuncias não pode estar em branco")
    @Past(message = "É digitado 0 se nenhum total de Denuncias for resolvida, maior que 0 se for resolvida. "   + " ")
    @Column(name = "total_denuncias", nullable = false)
    private Integer totalDenuncias;
        
    @NotNull(message = "Os casos pedentes não pode estar em branco")
    @Past(message = "É digitado 0 se nenhum pedente for resolvida, maior que 0 se for resolvida. "   + " ")
    @Column(name = "pedentes", nullable = false)
    private Integer pedentes;
    
    
    @NotNull(message = "As denuncias resolvidas não pode estar em branco")
    @Past(message = "É digitado 0 se nenhuma denucia for resolvida, maior que 0 se alguma denuncia for resolvida. "   + " ")
    @Column(name = "denuncias_resolvidas", nullable = false)
    private int denunciasResolvidas;

    
    @ManyToOne
    @JoinColumn(name = "fk_categoria", referencedColumnName = "pk_categoria")
    private Categoria categoria;
    
}
