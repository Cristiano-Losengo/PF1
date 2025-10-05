package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 *
 * @author cristiano
 */
@Entity
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "funcionalidade")
public class Funcionalidade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_funcionalidade")
    private Integer pkFuncionalidade;

    @Column(name = "descricao", nullable = false, length = 100)
    private String descricao;

    @Column(name = "designacao", nullable = false, length = 100)
    private String designacao;

    @Column(name = "url", nullable = false, length = 100)
    private String url;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Funcionalidade(String descricao, String designacao, String url, LocalDateTime createdAt) {
        this.descricao = descricao;
        this.designacao = designacao;
        this.url = url;
        this.createdAt = createdAt;
    }

    public Funcionalidade(Integer pkFuncionalidade, String descricao, String designacao, String url, LocalDateTime createdAt) {
        this.pkFuncionalidade = pkFuncionalidade;
        this.descricao = descricao;
        this.designacao = designacao;
        this.url = url;
        this.createdAt = createdAt;
    }


}
