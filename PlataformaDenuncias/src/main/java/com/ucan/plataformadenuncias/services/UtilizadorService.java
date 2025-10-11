package com.ucan.plataformadenuncias.services;
import com.ucan.plataformadenuncias.dto.UtilizadorDTO;
import com.ucan.plataformadenuncias.entities.Email;
import com.ucan.plataformadenuncias.entities.Telefone;
import com.ucan.plataformadenuncias.entities.Utilizador;
import com.ucan.plataformadenuncias.repositories.EmailRepository;
import com.ucan.plataformadenuncias.repositories.TelefoneRepository;
import com.ucan.plataformadenuncias.repositories.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


/**
 *
 * @author cristiano
 */
@Service
public class UtilizadorService {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private TelefoneRepository telefoneRepository;

    @Autowired
    private EmailRepository  emailRepository;

    public List<Utilizador> listarTodos() {
        return utilizadorRepository.findAll();
    }

    public Optional<Utilizador> buscarPorId(Integer id) {
        return utilizadorRepository.findById(id);
    }

    public Utilizador salvar(Utilizador utilizador) {
        return utilizadorRepository.save(utilizador);
    }

    public void deletar(Integer id) {
        utilizadorRepository.deleteById(id);
    }

    public List<UtilizadorDTO> findAll(){

        List<UtilizadorDTO> listUtilizadores = new ArrayList();

        for(Utilizador utilizadorModel : utilizadorRepository.findAll()) {
            UtilizadorDTO utilizadorDTO = new UtilizadorDTO();
            utilizadorDTO.setIdentificacao(utilizadorModel.getFkPessoa().getIdentificacao());
            utilizadorDTO.setDataNascimento(utilizadorModel.getFkPessoa().getDataNascimento());
            utilizadorDTO.setAtivo(utilizadorModel.getAtivo());
            utilizadorDTO.setNome(utilizadorModel.getFkPessoa().getNome());

            Telefone telefoneModel = telefoneRepository.findByFkPessoa(utilizadorModel.getFkPessoa().getPkPessoa());
            Email emailModel = emailRepository.findByFkPessoa(utilizadorModel.getFkPessoa());

            if(telefoneModel != null)
            {
                utilizadorDTO.setTelefone(telefoneModel.getNumero());
            }
            if(emailModel != null)
            {
                utilizadorDTO.setEmail(emailModel.getMail());
            }

            listUtilizadores.add(utilizadorDTO);
        }

        return listUtilizadores;
    }
    
}
