package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

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
    @JoinColumn(name = "fk_funcionalidade_pai")
    private Funcionalidade fkFuncionalidadePai;

    @Column(name = "funcionalidades_partilhadas", length = 250)
    private String funcionalidadesPartilhadas;

    @Column(name = "url", length = 100)
    private String url;

    @Column(name = "versao", length = 100)
    private String versao;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Funcionalidade(Integer pkFuncionalidade) {
        this.pkFuncionalidade = pkFuncionalidade;
    }

    public Funcionalidade(String url, String funcionalidadesPartilhadas, Funcionalidade fkFuncionalidadePai, Integer grupo, TipoFuncionalidade fkTipoFuncionalidade, String designacao, String descricao, Integer pkFuncionalidade) {
        this.url = url;
        this.funcionalidadesPartilhadas = funcionalidadesPartilhadas;
        this.fkFuncionalidadePai = fkFuncionalidadePai;
        this.grupo = grupo;
        this.fkTipoFuncionalidade = fkTipoFuncionalidade;
        this.designacao = designacao;
        this.descricao = descricao;
        this.pkFuncionalidade = pkFuncionalidade;
    }

    public Funcionalidade(Integer pkFuncionalidade, String descricao, String designacao, TipoFuncionalidade fkTipoFuncionalidade, Integer grupo, Funcionalidade fkFuncionalidadePai, String funcionalidadesPartilhadas, String url, String versao) {
        this.pkFuncionalidade = pkFuncionalidade;
        this.descricao = descricao;
        this.designacao = designacao;
        this.fkTipoFuncionalidade = fkTipoFuncionalidade;
        this.grupo = grupo;
        this.fkFuncionalidadePai = fkFuncionalidadePai;
        this.funcionalidadesPartilhadas = funcionalidadesPartilhadas;
        this.url = url;
        this.versao = versao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Funcionalidade that = (Funcionalidade) o;
        return Objects.equals(pkFuncionalidade, that.pkFuncionalidade) && Objects.equals(descricao, that.descricao) && Objects.equals(designacao, that.designacao) && Objects.equals(fkTipoFuncionalidade, that.fkTipoFuncionalidade) && Objects.equals(grupo, that.grupo) && Objects.equals(fkFuncionalidadePai, that.fkFuncionalidadePai) ;
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkFuncionalidade, descricao, designacao, fkTipoFuncionalidade, grupo, fkFuncionalidadePai);
    }

    public boolean isGingogo(Funcionalidade o)
    {
        return  Objects.equals(descricao, o.descricao) && Objects.equals(designacao, o.designacao) && Objects.equals(fkTipoFuncionalidade, o.fkTipoFuncionalidade) && Objects.equals(grupo, o.grupo) && Objects.equals(fkFuncionalidadePai, o.fkFuncionalidadePai) ;
    }

}
