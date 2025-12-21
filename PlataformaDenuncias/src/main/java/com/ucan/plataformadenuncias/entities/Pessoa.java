package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pessoa")
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_pessoa")
    private Integer pkPessoa;

    @NotBlank(message = "O nome não pode estar em branco")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento deve ser no passado")
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @NotBlank(message = "A identificação não pode estar em branco")
    @Size(max = 50, message = "A identificação deve ter no máximo 50 caracteres")
    @Column(name = "identificacao", unique = true, nullable = false, length = 50)
    private String identificacao;

    // CORREÇÃO: Removido @Past que é apenas para datas
    @NotBlank(message = "O sexo é obrigatório")
    @Size(max = 1, message = "O sexo deve ter no máximo 1 caractere")
    @Column(name = "sexo", nullable = false, length = 1)
    private String sexo;

    // NOVOS CAMPOS NECESSÁRIOS DO FRONTEND
    @NotBlank(message = "O estado civil é obrigatório")
    @Size(max = 20, message = "O estado civil deve ter no máximo 20 caracteres")
    @Column(name = "estado_civil", nullable = false, length = 20)
    private String estadoCivil;

    @NotBlank(message = "O telefone é obrigatório")
    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank(message = "A província é obrigatória")
    @Size(max = 100, message = "A província deve ter no máximo 100 caracteres")
    @Column(name = "provincia", nullable = false, length = 100)
    private String provincia;

    @NotBlank(message = "O município é obrigatório")
    @Size(max = 100, message = "O município deve ter no máximo 100 caracteres")
    @Column(name = "municipio", nullable = false, length = 100)
    private String municipio;

    @NotNull(message = "O estado é obrigatório")
    @Column(name = "estado", nullable = false)
    private Integer estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "fk_localidade", referencedColumnName = "pk_localidade")
    private Localidade localidade;

    // Relacionamento com Conta (se existir)
    @OneToOne(mappedBy = "pessoa", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Conta conta;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pessoa pessoa = (Pessoa) o;
        return Objects.equals(pkPessoa, pessoa.pkPessoa);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pkPessoa);
    }

    // Construtores atualizados
    public Pessoa(String nome, String identificacao, LocalDate dataNascimento, String sexo,
                  String estadoCivil, String telefone, String email,
                  String provincia, String municipio, Integer estado) {
        this.nome = nome;
        this.identificacao = identificacao;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
        this.estadoCivil = estadoCivil;
        this.telefone = telefone;
        this.email = email;
        this.provincia = provincia;
        this.municipio = municipio;
        this.estado = estado;
        this.createdAt = LocalDateTime.now();
    }

    public Pessoa(Integer pkPessoa) {
        this.pkPessoa = pkPessoa;
    }
}