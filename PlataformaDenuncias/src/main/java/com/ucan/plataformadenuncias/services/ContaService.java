package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class ContaService {

    @Autowired
    private ContaRepository repository;

    public Conta salvar(Conta conta) {
        return repository.save(conta);
    }

    public List<Conta> listarTodos() {
        return repository.findAll();
    }

    public Optional<Conta> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }

  
}
