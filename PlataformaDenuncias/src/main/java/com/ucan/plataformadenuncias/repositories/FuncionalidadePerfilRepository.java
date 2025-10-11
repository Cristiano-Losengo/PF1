package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface FuncionalidadePerfilRepository extends JpaRepository<FuncionalidadePerfil, Integer> {

}
