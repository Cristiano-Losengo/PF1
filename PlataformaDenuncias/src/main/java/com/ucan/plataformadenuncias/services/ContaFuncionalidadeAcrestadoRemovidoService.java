package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.ContaFuncionalidadeAcrestadoRemovido;
import com.ucan.plataformadenuncias.repositories.ContaFuncionalidadeAcrestadoRemovidoRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;




@Service
public class ContaFuncionalidadeAcrestadoRemovidoService {

    @Autowired
    private ContaFuncionalidadeAcrestadoRemovidoRepository repository;

    public ContaFuncionalidadeAcrestadoRemovido salvar(ContaFuncionalidadeAcrestadoRemovido obj) {
        return repository.save(obj);
    }

    public List<ContaFuncionalidadeAcrestadoRemovido> listarTodos() {
        return repository.findAll();
    }

    public Optional<ContaFuncionalidadeAcrestadoRemovido> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
