
package com.ucan.plataformadenuncias.repositories;

import com.ucan.plataformadenuncias.entities.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author cristiano
 */
@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {}

