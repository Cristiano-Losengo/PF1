package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Funcionalidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface FuncionalidadeRepository extends JpaRepository<Funcionalidade, Long>{
    
}
