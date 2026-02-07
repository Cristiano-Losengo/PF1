package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.repositories.ContaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author cristiano
 */
@Service
public class ContaService {

    @Autowired
    private ContaRepository contaRepository;

    public Conta salvar(Conta conta) {
        return contaRepository.save(conta);
    }

    public List<Conta> listarTodos() {
        return contaRepository.findAll();
    }

    public Optional<Conta> buscarPorId(Integer id) {
        return contaRepository.findById(id);
    }

    public void remover(Integer id) {
        contaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Conta carregarConta(String email) {
        return contaRepository
                .findContaComPerfisEFuncionalidadesByEmail(email)
                .orElseThrow();
    }

}
