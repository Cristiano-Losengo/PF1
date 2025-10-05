
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;


/**
 *
 * @author cristiano
 */
@Entity
@Table(name = "denuncia")
public class Denuncia {
    @Id @GeneratedValue
    @Column(name = "pk_denuncia")
    private Integer pkDenuncia;
    private String descricao;
   // private Data data;

    @ManyToOne
    @JoinColumn(name = "fk_categoria")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fk_localizacao")
    private Localidade localidade;
  
/*
    @OneToMany(mappedBy = "denuncia")
    @JoinColumn(name = "fk_cidadao")
    private List<Comentario> comentarios;
*/
    
    @OneToOne(mappedBy = "denuncia")
    private Resposta resposta;
    
    @NotNull(message = "A data de Ocorrecia é obrigatória")
    @Past(message = "A data de Ocorrecia pode ser no passado,ou no momento em que estiver sendo reportado ")
    @Column(name = "data_ocorrecia", nullable = false)
    private LocalDate dataOcorrecia;
}

