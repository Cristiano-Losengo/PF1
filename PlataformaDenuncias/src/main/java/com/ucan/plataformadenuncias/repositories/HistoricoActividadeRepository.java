package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.HistoricoActividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface HistoricoActividadeRepository extends JpaRepository<HistoricoActividade, Long>{
    
}
