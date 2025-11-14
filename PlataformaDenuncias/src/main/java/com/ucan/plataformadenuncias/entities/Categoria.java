
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 *
 * @author cristiano
 */
@Entity
@Table(name = "categoria")
public class Categoria {
    @Id @GeneratedValue
    @Column(name = "pk_categoria")
    private Integer pkCategoria;
   

    @NotBlank(message = "O nome não pode estar em branco")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_localidade", referencedColumnName = "pk_localidade", nullable = false)
    private Localidade localidade;
    
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Denuncia> denuncias;
    
}
