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

    @Column(name = "tipo_conta")
    private int tipoConta;

    @Column(name = "nome_completo", length = 50)
    private String nomeCompleto;

    @Column(name = "email", unique = true, nullable = false, length = 50)
    private String email;

    @Column(name = "senha", nullable = false, length = 50)
    private String senha;

    /*
    @Column(name = "fk_pessoa", nullable = false)
    private Pessoa fkPessoa;
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
        Conta conta = (Conta) o;
        return Objects.equals(pkConta, conta.pkConta);
    }

}
