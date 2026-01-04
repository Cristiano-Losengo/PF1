
package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.EstadoCivil;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface EstadoCivilRepository extends JpaRepository<EstadoCivil, Integer> {


    Optional<EstadoCivil> findByNome(String nome);

}

