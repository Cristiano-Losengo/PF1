
package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

/**
 *
 * @author cristiano
 */
@Setter
@Getter
@Entity
@Table(name = "versao")
public class Versao {
    @Id @GeneratedValue
    @Column(name = "pk_versao")
    private Integer pkVersao;

    /*
    @NotBlank(message = "O nome não pode estar em branco")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;
*/

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "versao", nullable = false)
    private int versao;

    @Column(name = "table", nullable = false, length = 150)
    private String table;

    @Column(name = "data", nullable = false)
    private Date data;

    public Versao(String table, Date data) {
        this.table = table;
        this.data = data;
    }
}
