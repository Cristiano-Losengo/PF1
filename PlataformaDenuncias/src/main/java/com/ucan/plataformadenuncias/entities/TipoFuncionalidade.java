package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 *
 * @author cristiano
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tipo_funcionalidade")
public class TipoFuncionalidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer pkTipoFuncionalidade;

    @Column(name = "designacao", length = 100)
    private String designacao;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TipoFuncionalidade(Integer pkTipoFuncionalidade) {
        this.pkTipoFuncionalidade = pkTipoFuncionalidade;
    }

    public TipoFuncionalidade(String designacao) {
        this.designacao = designacao;
    }
}
