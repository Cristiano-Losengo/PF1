package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Denuncia;
import com.ucan.plataformadenuncias.repositories.DenunciaRepository;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 🔧 IMPORTANTE

/**
 *
 * @author cristiano
 */
@Service
public class DenunciaService {

    @Autowired
    private DenunciaRepository denunciaRepository;

    // 🔧 ADICIONE @Transactional(readOnly = true) E USE O MÉTODO COM RELAÇÕES
    @Transactional(readOnly = true)
    public List<Denuncia> listarTodas() {
        return denunciaRepository.findAllComRelacoes(); // Use o novo método
    }

    public Denuncia salvar(Denuncia denuncia) {
        denuncia.setCodigo(gerarCodigo());
        return denunciaRepository.save(denuncia);
    }

    public Optional<Denuncia> buscarPorId(Integer id) {
        return denunciaRepository.findByIdWithRelations(id);
    }
    
    public Denuncia buscarPorCodigo(String codigo) {
        Denuncia den = denunciaRepository.findByCodigo(codigo);
        
        return den;
    }
    
    private String gerarCodigo() {
        String prefixo = "DEN";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
        int random = new Random().nextInt(999);
        return prefixo + "-" + timestamp + "-" + random;
    }
}
