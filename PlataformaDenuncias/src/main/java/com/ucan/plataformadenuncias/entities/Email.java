package com.ucan.plataformadenuncias.entities;

import com.ucan.plataformadenuncias.entities.Pessoa;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "email")
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer pkEmail;

    @Column(name = "detalhe")
    private String mail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_pessoa", referencedColumnName = "pk_pessoa", nullable = false)
    private Pessoa fkPessoa;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Email(Integer pkEmail, String mail, Pessoa pessoaId, LocalDateTime createdAt) {
        this.pkEmail = pkEmail;
        this.mail = mail;
        this.fkPessoa = pessoaId;
        this.createdAt = createdAt;
    }
}
