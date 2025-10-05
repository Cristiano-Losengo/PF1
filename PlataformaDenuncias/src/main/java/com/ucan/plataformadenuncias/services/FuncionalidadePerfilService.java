package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import com.ucan.plataformadenuncias.repositories.FuncionalidadePerfilRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author cristiano
 */
@Service
public class FuncionalidadePerfilService {

    @Autowired
    private FuncionalidadePerfilRepository repository;

    public FuncionalidadePerfil salvar(FuncionalidadePerfil obj) {
        return repository.save(obj);
    }

    public List<FuncionalidadePerfil> listarTodos() {
        return repository.findAll();
    }

    public Optional<FuncionalidadePerfil> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
