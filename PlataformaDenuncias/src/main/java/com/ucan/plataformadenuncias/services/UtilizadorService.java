package com.ucan.plataformadenuncias.services;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


/**
 *
 * @author cristiano
 */
@Service
public class UtilizadorService {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    public List<Utilizador> listarTodos() {
        return utilizadorRepository.findAll();
    }

    public Optional<Utilizador> buscarPorId(Long id) {
        return utilizadorRepository.findById(id);
    }

    public Utilizador salvar(Utilizador utilizador) {
        return utilizadorRepository.save(utilizador);
    }

    public void deletar(Long id) {
        utilizadorRepository.deleteById(id);
    }
    
}
