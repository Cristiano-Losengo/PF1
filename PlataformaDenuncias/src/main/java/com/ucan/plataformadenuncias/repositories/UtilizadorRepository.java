package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Pessoa;
import com.ucan.plataformadenuncias.entities.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilizadorRepository extends JpaRepository<Utilizador, Integer> {

    public Utilizador findByUsername(String username);
    public Utilizador findByPasswordHash(String password);
    public Utilizador findByUsernameAndPasswordHash(String username, String password);
    public Utilizador findByFkPessoa(Pessoa pessoaModel);

    //@Query("SELECT u FROM utilizador u WHERE u.username = :username AND u.password = :password")
    @Query(value = "SELECT * FROM utilizador WHERE username = :username AND password = :password", nativeQuery = true)
    public Optional<Utilizador> login(@Param("username") String username, @Param("password") String password);


}
