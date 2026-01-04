package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Denuncia;
import com.ucan.plataformadenuncias.repositories.DenunciaRepository;
import java.util.List;
import java.util.Optional;
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
        return denunciaRepository.save(denuncia);
    }

    public Optional<Denuncia> buscarPorId(Integer id) {
        return denunciaRepository.findByIdWithRelations(id);
    }
}
