package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.ContaFuncionalidadeAcrestadoRemovido;
import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.repositories.ContaFuncionalidadeAcrestadoRemovidoRepository;
import com.ucan.plataformadenuncias.repositories.ContaPerfilRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
/**
 *
 * @author cristiano
 */
@Service
public class ContaPerfilService {

    @Autowired
    private ContaPerfilRepository repository;

    public ContaPerfil salvar(ContaPerfil obj) {
        return repository.save(obj);
    }

    public List<ContaPerfil> listarTodos() {
        return repository.findAll();
    }

    public Optional<ContaPerfil> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public void remover(Integer id) {
        repository.deleteById(id);
    }
}
