package com.ucan.plataformadenuncias.entities;

import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.entities.Pessoa;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utilizador" )
public class Utilizador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "pk_utilizador")
    private Integer pkUtilizador;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_pessoa", referencedColumnName = "pk_pessoa", nullable = true)
    private Pessoa fkPessoa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_conta", referencedColumnName = "pk_conta", nullable = false)
    private Conta fkConta;

    // Campos adicionais relevantes para usuário
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "detalhe", columnDefinition = "TEXT")
    private String detalhe;

    public Utilizador(Integer pkUtilizador, Pessoa fkPessoa, Conta fkConta, String username, String email, String passwordHash, Boolean ativo, LocalDateTime createdAt) {
        this.pkUtilizador = pkUtilizador;
        this.fkPessoa = fkPessoa;
        this.fkConta = fkConta;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.ativo = ativo;
        this.createdAt = createdAt;
    }
}
