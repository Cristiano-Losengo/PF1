package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ContaRepository extends JpaRepository<Conta, Integer> {

    public Conta findByPkConta(Integer pkConta);

}
