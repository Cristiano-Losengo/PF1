package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface UtilizadorRepository extends JpaRepository<Utilizador, Long>{
    
}
