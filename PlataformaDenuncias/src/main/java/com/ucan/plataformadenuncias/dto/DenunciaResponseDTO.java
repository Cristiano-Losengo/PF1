/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ucan.plataformadenuncias.dto;

import com.ucan.plataformadenuncias.entities.Localidade;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 *
 * @author cristiano
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DenunciaResponseDTO {
    private Integer pkDenuncia;
    private String nome;
    private String descricaoDetalhada;
    private String tipoEspecifico;
    private String subtipo;
    private String anexo;
    private String localEspecificoDaOcorrencia;
    private boolean anonima;
    private String contacto;
    private String email;
    private LocalDate dataOcorrecia;
    
    // ✅✅✅ CERTIFIQUE-SE QUE ESTES CAMPOS EXISTEM:
    private LocalDateTime dataRegistro;
    private String provincia;
    
    // Campos de localidade
    private String municipio;
    private String bairro;
    private String nomeRua;
    
    // Categoria
    private String categoriaNome;

}
