package com.ucan.plataformadenuncias.entities;

import com.ucan.plataformadenuncias.enumerable.TipoContaEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "conta")
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_conta")
    private Integer pkConta;

    @NotNull(message = "Tipo de conta é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_conta", nullable = false, length = 20)
    private TipoContaEnum tipoConta;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Size(max = 50, message = "Email não pode exceder 50 caracteres")
    @Column(name = "email", unique = true, nullable = false, length = 50)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull(message = "Estado é obrigatório")
    @Column(name = "estado", nullable = false)
    private Integer estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Adicionar relacionamento com Pessoa
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_pessoa", referencedColumnName = "pk_pessoa")
    private Pessoa pessoa;

    // Adicionar relacionamento com Perfil
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_perfil", referencedColumnName = "pk_perfil")
    private Perfil perfil;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Conta conta = (Conta) o;
        return Objects.equals(pkConta, conta.pkConta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkConta);
    }

    // Construtor conveniente
    public Conta(String email, String passwordHash, TipoContaEnum tipoConta, Integer estado) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.tipoConta = tipoConta;
        this.estado = estado;
        this.createdAt = LocalDateTime.now();
    }
}