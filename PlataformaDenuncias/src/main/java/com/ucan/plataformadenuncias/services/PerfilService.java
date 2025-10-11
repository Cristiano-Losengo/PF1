package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.repositories.PerfilRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class PerfilService {

    @Autowired
    private PerfilRepository repository;

    public Perfil salvar(Perfil perfil) {
        return repository.save(perfil);
    }

    public List<Perfil> listarTodos() {
        return repository.findAll();
    }

    public Optional<Perfil> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public void remover(Integer id) {
        repository.deleteById(id);
    }
}

