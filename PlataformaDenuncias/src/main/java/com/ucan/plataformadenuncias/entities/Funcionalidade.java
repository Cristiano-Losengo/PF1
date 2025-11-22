package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;

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
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "funcionalidade")
public class Funcionalidade {

    @Id
    private Integer pkFuncionalidade;

    @Column(name = "descricao", length = 100)
    private String descricao;

    @Column(name = "designacao", length = 100)
    private String designacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_tipo_funcionalidade")
    private TipoFuncionalidade fkTipoFuncionalidade;

    @Column(name = "grupo")
    private Integer grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_funcionalidade")
    private Funcionalidade fkFuncionalidade;

    @Column(name = "funcionalidades_partilhadas", length = 250)
    private String funcionalidadesPartilhadas;

    @Column(name = "url", length = 100)
    private String url;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Funcionalidade(Integer pkFuncionalidade) {
        this.pkFuncionalidade = pkFuncionalidade;
    }

    public Funcionalidade(String descricao, String designacao, TipoFuncionalidade fkTipoFuncionalidade, Funcionalidade fk_funcionalidade, String funcionalidadesPartilhadas, String url) {
        this.descricao = descricao;
        this.designacao = designacao;
        this.fkTipoFuncionalidade = fkTipoFuncionalidade;
        this.fkFuncionalidade = fk_funcionalidade;
        this.funcionalidadesPartilhadas = funcionalidadesPartilhadas;
        this.url = url;
    }

    public Funcionalidade(String descricao, String designacao, TipoFuncionalidade fkTipoFuncionalidade, Funcionalidade fk_funcionalidade,  String url) {
        this.descricao = descricao;
        this.designacao = designacao;
        this.fkTipoFuncionalidade = fkTipoFuncionalidade;
        this.fkFuncionalidade = fk_funcionalidade;
        this.url = url;
    }

}
