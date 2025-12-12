package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.repositories.PerfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PerfilService {
    
    @Autowired
    private PerfilRepository perfilRepository;
    
    public List<Perfil> listarTodos() {
        return perfilRepository.findAll();
    }
    
    public Optional<Perfil> buscarPorId(Integer id) {
        return perfilRepository.findById(id);
    }
    
    public Perfil salvar(Perfil perfil) {
        return perfilRepository.save(perfil);
    }
    
    public void remover(Integer id) {
        perfilRepository.deleteById(id);
    }
}
