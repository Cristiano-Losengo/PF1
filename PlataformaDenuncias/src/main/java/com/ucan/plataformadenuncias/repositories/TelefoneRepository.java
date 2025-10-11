package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Telefone;
import org.apache.poi.ss.formula.functions.T;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface TelefoneRepository extends JpaRepository<Telefone, Integer> {

    @Query(value = "SELECT * FROM telefone WHERE fk_pessoa = :pk_pessoa", nativeQuery = true)
    public Telefone findByFkPessoa(@Param("pk_pessoa") Integer pkPessoa);



}
