
package com.ucan.plataformadenuncias.dto;

/**
 *
 * @author cristiano
 */


import com.ucan.plataformadenuncias.entities.Denuncia;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



        
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DenunciaRequestDTO {
     private Integer pkDenuncia;
     private String nome;
    private String descricaoDetalhada;
    private String tipoEspecifico;
    private String anexo;
    private String localEspecificoDaOcorrencia;
    private String subtipo;
    private boolean anonima;
    private String contacto;
    private LocalDate dataOcorrecia;
    private LocalDateTime dataRegistro;
    private String email;
    
    // Campos de localidade
    private String provincia;
    private String municipio;
    private String bairro;
    private String nomeRua;
    //private String numeroRua; 
    private String local;
    
    // Categoria
    private String categoriaNome;
    
        public DenunciaRequestDTO(Denuncia denuncia) {
        this.pkDenuncia = denuncia.getPkDenuncia();
        this.nome = denuncia.getNome();
        this.descricaoDetalhada = denuncia.getDescricaoDetalhada();
        this.tipoEspecifico = denuncia.getTipoEspecifico();
        this.subtipo = denuncia.getSubtipo();
        this.anexo = denuncia.getAnexo();
        this.localEspecificoDaOcorrencia = denuncia.getLocalEspecificoDaOcorrencia();
        this.anonima = denuncia.isAnonima();
        this.contacto = denuncia.getContacto();
        this.email = denuncia.getEmail();
        this.dataOcorrecia = denuncia.getDataOcorrecia();
        this.dataRegistro = denuncia.getDataRegistro();
        this.provincia = denuncia.getProvincia();
        
        // Extrair informações da localidade
        if (denuncia.getLocalidade() != null) {
            this.bairro = denuncia.getLocalidade().getNome();
            this.nomeRua = denuncia.getLocalidade().getNomeRua();
            //this.numeroRua = denuncia.getLocalidade().getNumero();
            
            if (denuncia.getLocalidade().getLocalidadePai() != null) {
                this.municipio = denuncia.getLocalidade().getLocalidadePai().getNome();
            } else {
                this.municipio = denuncia.getLocalidade().getNome();
            }
        }
        
        // Extrair categoria
        if (denuncia.getCategoria() != null) {
            this.categoriaNome = denuncia.getCategoria().getNome();
        }
    }
}

