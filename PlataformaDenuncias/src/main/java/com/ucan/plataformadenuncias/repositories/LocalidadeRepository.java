
package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Localidade;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface LocalidadeRepository extends JpaRepository<Localidade, Integer> {

    public Localidade findByNome(String pai);
      List<Localidade> findByFkLocalidadePai(Localidade fkLocalidadePai);
    public Localidade findByNomeAndFkLocalidadePai_Nome(String nome, String paiNome);
}

