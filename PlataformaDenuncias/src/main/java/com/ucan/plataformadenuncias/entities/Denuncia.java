package com.ucan.plataformadenuncias.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "denuncia")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_denuncia")
    private Integer pkDenuncia;

    private String nome;

    @Column(name = "descricao_detalhada", columnDefinition = "TEXT")
    private String descricaoDetalhada;

    @Column(name = "tipo_especifico")
    private String tipoEspecifico;

    private String subtipo;

    private String anexo;

    @Column(name = "local_especifico_ocorrencia")
    private String localEspecificoDaOcorrencia;

    private boolean anonima;

    private String contacto;
    private String email;

    private LocalDateTime dataRegistro = LocalDateTime.now();
    private String provincia;
    
    @NotNull
    @Past
    @Column(name = "data_ocorrencia", nullable = false)
    private LocalDate dataOcorrecia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_categoria")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_localidades", nullable = false)
    private Localidade localidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_pessoa")
    private Pessoa pessoa;
    
 
    @OneToMany(mappedBy = "denuncia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Resposta> respostas;
}
