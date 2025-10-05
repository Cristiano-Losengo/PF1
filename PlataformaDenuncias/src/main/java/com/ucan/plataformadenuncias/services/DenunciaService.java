package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Denuncia;
import com.ucan.plataformadenuncias.repositories.DenunciaRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class DenunciaService {
    @Autowired
    private DenunciaRepository denunciaRepo;
    public List<Denuncia> listarTodas() {
        return denunciaRepo.findAll();
    }
    public Denuncia salvar(Denuncia denuncia) {
        return denunciaRepo.save(denuncia);
    }
}
