package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.entities.Pessoa;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Integer> {

    public Conta findByPkConta(Integer pkConta);

    Optional<Conta> findByEmail(String email);
    
    boolean existsByEmail(String email);
   
    Long countByFkPessoa(Pessoa pessoa);

     
}
