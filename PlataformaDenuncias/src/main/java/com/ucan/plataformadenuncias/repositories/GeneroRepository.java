
package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Genero;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface GeneroRepository extends JpaRepository<Genero, Integer> {


    Optional<Genero> findByNome(String nome);

}

