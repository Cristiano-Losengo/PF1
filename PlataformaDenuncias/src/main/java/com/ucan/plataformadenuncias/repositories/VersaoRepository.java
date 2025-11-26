package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Versao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VersaoRepository extends JpaRepository<Versao, String> {

    public Versao findByTable(String table);

}
