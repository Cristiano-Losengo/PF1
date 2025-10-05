package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Resposta;
import com.ucan.plataformadenuncias.repositories.RespostaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author cristiano
 */
@Service
public class RespostaService {

    @Autowired
    private RespostaRepository respostaRepository;

    public List<Resposta> listarTodas() {
        return respostaRepository.findAll();
    }

    public Optional<Resposta> buscarPorId(Long id) {
        return respostaRepository.findById(id);
    }

    public Resposta salvar(Resposta resposta) {
        return respostaRepository.save(resposta);
    }

    public void deletar(Long id) {
        respostaRepository.deleteById(id);
    }
    
    
}
