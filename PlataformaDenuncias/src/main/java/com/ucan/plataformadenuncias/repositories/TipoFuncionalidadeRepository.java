package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.TipoFuncionalidade;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoFuncionalidadeRepository extends JpaRepository<TipoFuncionalidade, Integer> {

List<TipoFuncionalidade> findAllByOrderByPkTipoFuncionalidadeAsc();

}
