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
@Table(name = "conta_perfil")
public class ContaPerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_conta_perfil")
    private Integer pkContaPerfil;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_conta", nullable = false)
    private Conta fkConta;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_perfil", nullable = false)
    private Perfil fkPerfil;

    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
