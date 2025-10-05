package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.HistoricoActividade;
import com.ucan.plataformadenuncias.repositories.HistoricoActividadeRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class HistoricoActividadeService {

    @Autowired
    private HistoricoActividadeRepository repository;

    public HistoricoActividade salvar(HistoricoActividade historico) {
        return repository.save(historico);
    }

    public List<HistoricoActividade> listarTodos() {
        return repository.findAll();
    }

    public Optional<HistoricoActividade> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
