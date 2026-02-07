package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.enumerable.TipoContaEnum;
import com.ucan.plataformadenuncias.enumerable.TipoLocalidade;
import com.ucan.plataformadenuncias.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Component;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private final PessoaRepository pessoaRepository;
    private final FuncionalidadeRepository funcionalidadeRepository;
    private final FuncionalidadePerfilRepository funcionalidadePerfilRepository;
    private final PerfilRepository perfilRepository;
    private final ContaRepository contaRepository;
    private final TelefoneRepository telefoneRepository;
    
    private final GeneroRepository generoRepository;
    private final EstadoCivilRepository estadoCivilRepository;
    private final VersaoRepository versaoRepository;
    private final LocalidadeRepository localidadeRepository;


    
    
    public DataLoader(PessoaRepository pessoaRepository,
                      FuncionalidadeRepository funcionalidadeRepository,
                      FuncionalidadePerfilRepository funcionalidadePerfilRepository,
                      PerfilRepository perfilRepository,
                      ContaRepository contaRepository,
                      TelefoneRepository telefoneRepository ,
                      GeneroRepository generoRepository, EstadoCivilRepository estadoCivilRepository, VersaoRepository versaoRepository, LocalidadeRepository localidadeRepository) {

        this.pessoaRepository = pessoaRepository;
        this.funcionalidadeRepository = funcionalidadeRepository;
        this.funcionalidadePerfilRepository = funcionalidadePerfilRepository;
        this.perfilRepository = perfilRepository;
        this.contaRepository = contaRepository;
        this.telefoneRepository = telefoneRepository;
        this.generoRepository = generoRepository;
        this.estadoCivilRepository = estadoCivilRepository;

        this.versaoRepository = versaoRepository;
        this.localidadeRepository = localidadeRepository;
    }

    @Override
    public void run(String... args) throws Exception {

    /*
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

            funcionalidadeRepository.save(new Funcionalidade("Cadastrar", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Visualizar", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Confirmar Pagamento", "", "", TipoFuncionalidadeEnum.FORM));
            funcionalidadeRepository.save(new Funcionalidade("Enviar Notificação", "", "", TipoFuncionalidadeEnum.FORM));

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

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilFuncionalidade, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilFuncionalidade, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilPerfil, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilPerfil, "", "", LocalDateTime.now()));

            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeCadastrar, perfilConta, "", "", LocalDateTime.now()));
            funcionalidadePerfilRepository.save(new FuncionalidadePerfil(funcionalidadeListar, perfilConta, "", "", LocalDateTime.now()));

            System.out.println("FuncionalidadesPerfis iniciais carregados.");
        } else {
            System.out.println("Autorities. Nenhum dado inicial carregado.");
        }
    */

    generoRepository.save(new Genero(1, "Masculino"));
    generoRepository.save(new Genero(2, "Feminino"));

    estadoCivilRepository.save(new EstadoCivil(1, "SOLTEIRO"));
    estadoCivilRepository.save(new EstadoCivil(2, "CASADO"));
    estadoCivilRepository.save(new EstadoCivil(3, "DIVORCIADO"));
    estadoCivilRepository.save(new EstadoCivil(4, "VIUVO"));
    estadoCivilRepository.save(new EstadoCivil(5, "UNIAO_DE_FACTO"));



    Localidade localidade =  new Localidade();
    localidade.setNome("Luanda");
    localidade.setTipo(TipoLocalidade.RUA);
    localidade.setNomeRua("Porto Santo");

    localidade  = localidadeRepository.save(localidade);


    Pessoa pessoa = new Pessoa();
    pessoa.setIdentificacao("AAABBBCCC");
    pessoa.setNome("Whitney Houston");
    LocalDate dataNascimento =  LocalDate.now();
    pessoa.setDataNascimento(dataNascimento);
    pessoa.setFkGenero(new Genero(1));
    pessoa.setFkEstadoCivil(new EstadoCivil(1));
    pessoa.setLocalidade(localidade);

    Optional<Pessoa> pessoaExistente =
            pessoaRepository.findByIdentificacao(pessoa.getIdentificacao());

    if (pessoaExistente == null) {
        pessoa = pessoaRepository.save(pessoa); // INSERT
    } else {
        pessoa = pessoaExistente.get(); // entidade já persistida
    }

    Conta conta = contaRepository.findByEmail("whitney@gmail.com")
            .orElseGet(Conta::new);

    conta.setTipoConta(TipoContaEnum.ADMIN);
    conta.setFkPessoa(pessoa);
    conta.setEmail("whitney@gmail.com");
    conta.setPasswordHash("whitney");
    contaRepository.save(conta);

   // Perfil perfil = perfilRepository.

    ContaPerfil contaPerfil =  new ContaPerfil();
    contaPerfil.setFkConta(conta);

    Versao versao =  new Versao();
    versao.setData(Calendar.getInstance().getTime());
    versao.setNomeTabela("tipo_funcionalidade");
    versao.setDescricao("versao 1");

    versaoRepository.save(versao);

    Versao versao2 =  new Versao();
    versao2.setData(Calendar.getInstance().getTime());
    versao2.setNomeTabela("funcionalidade");
    versao2.setDescricao("versão 1");

    versaoRepository.save(versao2);

    }

}