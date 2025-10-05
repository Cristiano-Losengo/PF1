
package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Localidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface LocalidadeRepository extends JpaRepository<Localidade, Long> {

    public Localidade findByNome(String pai);

       
    public Localidade findByNomeAndFkLocalidadePai_Nome(String nome, String paiNome);
}

