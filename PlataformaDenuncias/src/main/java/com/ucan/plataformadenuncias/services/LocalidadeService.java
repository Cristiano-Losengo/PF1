package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Localidade;
import com.ucan.plataformadenuncias.repositories.LocalidadeRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LocalidadeService {

    @Autowired
    private LocalidadeRepository repository;

    public List<Localidade> listarTodas() {
        return repository.findAll();
    }

    public Optional<Localidade> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Localidade salvar(Localidade localidade) {
        return repository.save(localidade);
    }

    public void eliminar(Integer id) {
        repository.deleteById(id);
    }

    public List<Localidade> listarPorLocalidadePai(Integer idPai) {
        Localidade pai = repository.findById(idPai).orElse(null);
        return repository.findByFkLocalidadePai(pai);
    }
}
