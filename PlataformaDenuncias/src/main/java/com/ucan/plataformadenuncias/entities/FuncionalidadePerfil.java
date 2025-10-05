
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "funcionalidade_perfil")
public class FuncionalidadePerfil {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_funcionalidade_perfil")
    private Integer pkFuncionalidadePerfil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_funcionalidade", nullable = false)
    private Funcionalidade fkFuncionalidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_perfil", nullable = false)
    private Perfil fkPerfil;

    @Column(name = "detalhe", length = 500)
    private String detalhe;

    @Column(name = "anexo", nullable = false)
    private String anexo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FuncionalidadePerfil(Funcionalidade fkFuncionalidade, Perfil fkPerfil, String detalhe, String anexo, LocalDateTime createdAt) {
        this.fkFuncionalidade = fkFuncionalidade;
        this.fkPerfil = fkPerfil;
        this.detalhe = detalhe;
        this.anexo = anexo;
        this.createdAt = createdAt;
    }
    
    
}
