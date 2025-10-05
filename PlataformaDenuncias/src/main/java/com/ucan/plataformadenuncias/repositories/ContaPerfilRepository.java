package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.ContaPerfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface ContaPerfilRepository extends JpaRepository<ContaPerfil, Long>{
    
}
