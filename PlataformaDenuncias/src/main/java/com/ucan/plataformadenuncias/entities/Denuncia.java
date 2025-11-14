
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 *
 * @author cristiano
 */
@Entity
@Getter
@Setter
@AllArgsConstructor

@Table(name = "denuncia")
public class Denuncia {
    @Id @GeneratedValue
    @Column(name = "pk_denuncia")
    private Integer pkDenuncia;
    private String nome;
    private String descricao;
    private LocalDateTime dataRegistro = LocalDateTime.now();
    private String subtipo; // Exemplo: "Falta de Água", "Água Suja"
    private boolean anonima;
 
    @ManyToOne
    @JoinColumn(name = "fk_categoria")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fk_localidades",  nullable = false)
    private Localidade localidade;
    
    
    
    @ManyToOne
    @JoinColumn(name = "utilizador", nullable = true)
    private Utilizador utilizador;
    
    @OneToOne(mappedBy = "denuncia")
    private Resposta resposta;
    
    @NotNull(message = "A data de Ocorrecia é obrigatória")
    @Past(message = "A data de Ocorrecia pode ser no passado,ou no momento em que estiver sendo reportado ")
    @Column(name = "data_ocorrecia", nullable = false)
    private LocalDate dataOcorrecia;
}

