package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @NotNull(message = "O tipo de sexo  é obrigatória")
    @Past(message = "O sexo deve ter no máximo 1 caracteres")
    @Column(name = "sexo", nullable = true)
    private String sexo;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "fk_localidade", referencedColumnName = "pk_localidade")
    private Localidade localidade;

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

    public Pessoa(String nome,String identificacao, LocalDate dataNascimento,String sexo ) {
        this.nome = nome;
        this.identificacao = identificacao;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
    }

    public Pessoa(String nome,String identificacao, LocalDate dataNascimento ) {
        this.nome = nome;
        this.identificacao = identificacao;
        this.dataNascimento = dataNascimento;
    }

    public Pessoa(Integer pkPessoa) {
        this.pkPessoa = pkPessoa;
    }

}
