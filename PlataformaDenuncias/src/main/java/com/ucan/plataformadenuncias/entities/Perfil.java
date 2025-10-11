
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
@ToString(exclude = {"fkPerfil", "subPerfis"}) // evita loop no Lombok
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "perfil")
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer pkPerfil;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "detalhes", length = 100)
    private String detalhes;

    @Column(name = "url", length = 100)
    private String url;

    // Muitos perfis podem ter o mesmo perfil "pai"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_perfil")
    private Perfil fkPerfil;

    // Um perfil pode ter vários sub-perfis (lado inverso do relacionamento)
/*
    @OneToMany(mappedBy = "fkPerfil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Perfil> subPerfis = new ArrayList<>();
*/
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Perfil perfil = (Perfil) o;
        return Objects.equals(pkPerfil, perfil.pkPerfil);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkPerfil);
    }

    public Perfil(int pkPerfil, String nome, String detalhes, String url, Perfil fkPerfil,  LocalDateTime createdAt) {
        this.pkPerfil = pkPerfil;
        this.nome = nome;
        this.detalhes = detalhes;
        this.url = url;
        this.createdAt = createdAt;
    }

    public Perfil(String nome, String detalhes, String url, Perfil fkPerfil, LocalDateTime createdAt) {
        this.nome = nome;
        this.detalhes = detalhes;
        this.url = url;
        this.fkPerfil = fkPerfil;
        this.createdAt = createdAt;
    }

    public Perfil(Integer pkPerfil) {
        this.pkPerfil = pkPerfil;
    }
}
