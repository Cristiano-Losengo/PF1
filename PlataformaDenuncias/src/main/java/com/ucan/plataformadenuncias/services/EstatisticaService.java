package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Estatistica;
import com.ucan.plataformadenuncias.repositories.EstatisticaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class EstatisticaService {

    @Autowired
    private EstatisticaRepository repository;

    public Estatistica salvar(Estatistica estatistica) {
        return repository.save(estatistica);
    }

    public List<Estatistica> listarTodos() {
        return repository.findAll();
    }

    public Optional<Estatistica> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
