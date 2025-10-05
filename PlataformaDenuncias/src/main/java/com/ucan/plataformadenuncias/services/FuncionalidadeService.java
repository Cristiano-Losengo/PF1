package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Funcionalidade;
import com.ucan.plataformadenuncias.repositories.FuncionalidadeRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class FuncionalidadeService {

    @Autowired
    private FuncionalidadeRepository repository;

    public Funcionalidade salvar(Funcionalidade func) {
        return repository.save(func);
    }

    public List<Funcionalidade> listarTodos() {
        return repository.findAll();
    }

    public Optional<Funcionalidade> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
