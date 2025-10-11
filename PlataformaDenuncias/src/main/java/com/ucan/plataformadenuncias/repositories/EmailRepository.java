package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Email;
import com.ucan.plataformadenuncias.entities.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface EmailRepository extends JpaRepository<Email, Integer> {

    public Email findByFkPessoa(Pessoa pessoaModel);

}
