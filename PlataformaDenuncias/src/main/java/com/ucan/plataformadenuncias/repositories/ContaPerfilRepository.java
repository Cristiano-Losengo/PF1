package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.entities.Perfil;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContaPerfilRepository extends JpaRepository<ContaPerfil, Integer> {
    
        @Query("SELECT COUNT(cp) FROM ContaPerfil cp WHERE cp.fkPerfil = :perfil")
    Long countByFkPerfil(@Param("perfil") Perfil perfil);
    
    
    List<ContaPerfil> findByFkPerfil(Perfil perfil);
    
}
