package com.ucan.plataformadenuncias.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


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

    @Column(name = "nome", unique = true, nullable = false, length = 50)
    private String nome;

    @Column(name = "detalhes", length = 50)
    private String detalhes;

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
        Conta conta = (Conta) o;
        return Objects.equals(pkConta, conta.pkConta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkConta);
    }

    public Conta(Integer pkConta, String username, LocalDateTime createdAt) {
        this.pkConta = pkConta;
        this.nome = username;
        this.createdAt = createdAt;
    }

    public Conta(String username, String detalhes, LocalDateTime createdAt) {
        this.nome = username;
        this.detalhes = detalhes;
        this.createdAt = createdAt;
    }

    public Conta(Integer pkConta) {
        this.pkConta = pkConta;
    }

    @Override
    public String toString() {
        return "ContaModel{" +
                "pkConta=" + pkConta +
                ", username='" + nome + '\'' +
                ", detalhes='" + detalhes + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
  
  
  

}
