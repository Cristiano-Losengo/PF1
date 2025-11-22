package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    private final PessoaRepository pessoaRepository;
    private final UtilizadorRepository utilizadorRepository;
    private final FuncionalidadeRepository funcionalidadeRepository;
    private final FuncionalidadePerfilRepository funcionalidadePerfilRepository;
    private final PerfilRepository perfilRepository;
    private final ContaRepository contaRepository;
    private final TelefoneRepository telefoneRepository;
    private final EmailRepository emailRepository;


    public DataLoader(PessoaRepository pessoaRepository,
                      UtilizadorRepository utilizadorRepository,
                      FuncionalidadeRepository funcionalidadeRepository,
                      FuncionalidadePerfilRepository funcionalidadePerfilRepository,
                      PerfilRepository perfilRepository,
                      ContaRepository contaRepository,
                      TelefoneRepository telefoneRepository,
                      EmailRepository emailRepository) {

        this.pessoaRepository = pessoaRepository;
        this.utilizadorRepository = utilizadorRepository;
        this.funcionalidadeRepository = funcionalidadeRepository;
        this.funcionalidadePerfilRepository = funcionalidadePerfilRepository;
        this.perfilRepository = perfilRepository;
        this.contaRepository = contaRepository;
        this.telefoneRepository = telefoneRepository;
        this.emailRepository = emailRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (pessoaRepository.count() == 0) {
            pessoaRepository.save(new Pessoa("Witney Houston", "123AAA", LocalDate.now()));
            pessoaRepository.save(new Pessoa("Paul Washer", "123BBB", LocalDate.now()));
            pessoaRepository.save(new Pessoa("Carlos Burity", "123CCC", LocalDate.now()));

            pessoaRepository.save(new Pessoa("admin", "00112233", LocalDate.now()));

            Telefone telefoneModel = new Telefone();
            telefoneModel.setNumero("");
            telefoneModel.setFkPessoa(new Pessoa(4));
            telefoneRepository.save(telefoneModel);

            System.out.println("Perfis iniciais carregados.");
        } else {
            System.out.println("PessoaModels já existentes. Nenhum dado inicial carregado.");
        }

        if (contaRepository.count() == 0) {

            contaRepository.save(new Conta(1, Defs.CONTA_ROOT, LocalDateTime.now()));
            contaRepository.save(new Conta(2, Defs.CONTA_DEFAULT, LocalDateTime.now()));

            System.out.println("Utilizadores iniciais carregados.");

        } else {
            System.out.println("Utilizadores já existentes. Nenhum dado inicial carregado.");
        }

        if (utilizadorRepository.count() == 0) {

            Conta contaModelUm = contaRepository.findAll().get(0);
            Conta contaModelDois = contaRepository.findAll().get(1);

            Pessoa pessoaModelUm = pessoaRepository.findAll().get(0);
            Pessoa pessoaModelDois = pessoaRepository.findAll().get(1);

            Pessoa pessoaModelAdmin = pessoaRepository.findAll().get(3);

            utilizadorRepository.save(new Utilizador(1, pessoaModelUm, contaModelUm, "whitney", "whitney@gmail.com", "123", true, LocalDateTime.now()));
            utilizadorRepository.save(new Utilizador(2, pessoaModelDois, contaModelDois, "paul", "paul@gmail.com", "123", true, LocalDateTime.now()));

            utilizadorRepository.save(new Utilizador(3, pessoaModelAdmin, contaModelUm, "admin", "admin@gmail.com", "admin", true, LocalDateTime.now()));

            System.out.println("Utilizadores iniciais carregados.");
        } else {
            System.out.println("Utilizadores já existentes. Nenhum dado inicial carregado.");
        }

        if (perfilRepository.count() == 0) {

            // sao as areas do sistema

            // Perfis básicos
            perfilRepository.save(new Perfil("Motorista", "Administração", null, null, LocalDateTime.now()));
            perfilRepository.save(new Perfil("Veiculo", "Administração", null, null, LocalDateTime.now()));
            perfilRepository.save(new Perfil("Gestão de Usuários", "Administração", null, null, LocalDateTime.now()));
            perfilRepository.save(new Perfil("Gestão de Multas", "Administração", null, null, LocalDateTime.now()));
            perfilRepository.save(new Perfil("Gestão de Notificações", "Administração", null, null, LocalDateTime.now()));
            perfilRepository.save(new Perfil("Segurança", "Administração", null, null, LocalDateTime.now()));
// Salva e pega o objeto de Segurança

// Submenus vinculados ao perfil Segurança
            //PerfilModel perfilModelSeguranca =  perfilRepository.findAll().get(5);
            System.out.println("Ja chegamos!");
            //       System.out.println(perfilModelSeguranca);
            perfilRepository.save(new Perfil("Gestão Funcionalidades", "Administração", null, new Perfil(6), LocalDateTime.now()));
            perfilRepository.save(new Perfil("Gestão de Perfil", "Administração", null, new Perfil(6), LocalDateTime.now()));
            perfilRepository.save(new Perfil("Gestão de Contas", "Administração", null, new Perfil(6), LocalDateTime.now()));

            System.out.println("Perfil iniciais carregados.");
        } else {
            System.out.println("Autorities. Nenhum dado inicial carregado.");
        }

        if (funcionalidadeRepository.count() == 0) {

            // sao as opcoes que o sistema permite fazer
/*
            funcionalidadeRepository.save(new Funcionalidade("Cadastrar", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Visualizar", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Confirmar Pagamento", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Enviar Notificação", "", "", TipoFuncionalidadeEnum.FORM));
*/
            System.out.println("Funcionalidades iniciais carregados.");
        } else {
            System.out.println("Autorities. Nenhum dado inicial carregado.");
        }

        if (funcionalidadePerfilRepository.count() == 0) {

            Perfil perfilSeguranca = perfilRepository.findByPkPerfil(6);
            Perfil perfilFuncionalidade = perfilRepository.findByPkPerfil(7);
            Perfil perfilPerfil = perfilRepository.findByPkPerfil(8);
            Perfil perfilConta = perfilRepository.findByPkPerfil(9);

            Funcionalidade funcionalidadeCadastrar = funcionalidadeRepository.findByPkFuncionalidade(1);
            Funcionalidade funcionalidadeListar = funcionalidadeRepository.findByPkFuncionalidade(2);
/*
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilPerfil, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilPerfil, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilConta, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilConta, "", "", LocalDateTime.now()));
*/
            System.out.println("FuncionalidadesPerfis iniciais carregados.");
        } else {
            System.out.println("Autorities. Nenhum dado inicial carregado.");
        }

    }

}
