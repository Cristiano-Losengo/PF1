package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Localidade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocalidadeRepository extends JpaRepository<Localidade, Integer> {

    Optional<Localidade> findByNome(String nome);

    List<Localidade> findByFkLocalidadePai(Localidade fkLocalidadePai);

    Optional<Localidade> findByNomeAndFkLocalidadePaiNome(String nome, String paiNome);

}
