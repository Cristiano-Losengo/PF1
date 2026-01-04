package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DenunciaRepository extends JpaRepository<Denuncia, Integer> {

    List<Denuncia> findByAnonima(boolean anonima);

    @Query("""
        SELECT d FROM Denuncia d
        JOIN FETCH d.categoria
        JOIN FETCH d.localidade
        LEFT JOIN FETCH d.pessoa
        WHERE d.pkDenuncia = :id
    """)
    Optional<Denuncia> findByIdWithRelations(@Param("id") Integer id);

@Query("""
        SELECT DISTINCT d FROM Denuncia d
        LEFT JOIN FETCH d.categoria
        LEFT JOIN FETCH d.localidade l
        LEFT JOIN FETCH l.localidadePai
        LEFT JOIN FETCH d.pessoa
        LEFT JOIN FETCH d.respostas
        ORDER BY d.dataRegistro DESC
    """)
    List<Denuncia> findAllComRelacoes();

}
