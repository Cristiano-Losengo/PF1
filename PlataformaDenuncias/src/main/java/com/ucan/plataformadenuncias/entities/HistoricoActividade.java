package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "historico_actividade")
public class HistoricoActividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_historico_actividade")
    private Integer pkHistoricoActividade;



    @Column(name = "data_login", nullable = false)
    private LocalDateTime dataLogin;

    @Column(name = "data_logout")
    private LocalDateTime dataLogout;

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
        HistoricoActividade that = (HistoricoActividade) o;
        return Objects.equals(pkHistoricoActividade, that.pkHistoricoActividade);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkHistoricoActividade);
    }

    @Override
    public String toString() {
        return "HistoricoActividade{" +
                "pkHistoricoActividade=" + pkHistoricoActividade +
                ", dataLogin=" + dataLogin +
                ", dataLogout=" + dataLogout +
                '}';
    }
}
