package com.ucan.plataformadenuncias.repositories;


import com.ucan.plataformadenuncias.entities.Pessoa;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Integer> {

    public Pessoa findByPkPessoa(Integer pkPessoa);
    
    Optional<Pessoa> findByNome(String nome);
    
    // ✅ NOVO método (opcional) - busca por nome exato
    @Query("SELECT p FROM Pessoa p WHERE p.nome = :nome")
    Pessoa findByNomeExato(@Param("nome") String nome);
    
    // ✅ Buscar por nome contendo (case insensitive)
    @Query("SELECT p FROM Pessoa p WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Pessoa> findByNomeContendo(@Param("nome") String nome);


}

