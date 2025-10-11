package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Integer> {

    public Perfil findByPkPerfil(Integer pkPerfil);
}
