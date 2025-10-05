
package com.ucan.plataformadenuncias.entities;

import com.ucan.plataformadenuncias.config.Constantes;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "conta_funcionalidade_acrestado_removido")
public class ContaFuncionalidadeAcrestadoRemovido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_conta_funcionalidade_acrestado_removido")
    private Integer pkContaFuncionalidadeAcrestadoRemovido;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_conta", nullable = false)
    private Conta fkConta;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_perfil", nullable = false)
    private Perfil fkPerfil;

    @Column(name = "tipo_acao")
    private int tipoAcao = Constantes.INSERIR;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



}
