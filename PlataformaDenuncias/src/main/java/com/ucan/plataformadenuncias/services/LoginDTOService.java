package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.dto.LoginDTO;
import com.ucan.plataformadenuncias.entities.Conta;
import com.ucan.plataformadenuncias.entities.ContaPerfil;
import com.ucan.plataformadenuncias.entities.FuncionalidadePerfil;
import com.ucan.plataformadenuncias.entities.Perfil;
import com.ucan.plataformadenuncias.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoginDTOService {

   // Conta -> ContaPerfil -> Perfis -> FuncionalidadePerfil -> Funcionalidades

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    @Autowired
    private ContaPerfilRepository contaPerfilRepository;

    @Autowired
    private FuncionalidadePerfilRepository funcionalidadePerfilRepository;

    /**
     *
     * @param username
     * @param passwordHash
     * @return
     */
    public LoginDTO findByUsernameAndPasswordHash(String username, String passwordHash)
    {
        Conta conta = contaRepository.findByEmailAndPasswordHash(username, passwordHash);
        List<ContaPerfil> contaPerfis = contaPerfilRepository.findAllByFkConta(conta);
    //    FuncionalidadePerfil funcionalidadePerfil = funcionalidadePerfilRepository.findByFkPerfil(contaPerfis.get(0).getFkPerfil());
        LoginDTO  loginDTO = new LoginDTO();

        return null;
    }


}
