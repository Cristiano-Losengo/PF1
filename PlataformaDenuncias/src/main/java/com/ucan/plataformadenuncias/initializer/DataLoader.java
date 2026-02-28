package com.ucan.plataformadenuncias.initializer;

import com.ucan.plataformadenuncias.config.Defs;
import com.ucan.plataformadenuncias.config.FuncionsHelper;
import com.ucan.plataformadenuncias.entities.*;
import com.ucan.plataformadenuncias.enumerable.TipoContaEnum;
import com.ucan.plataformadenuncias.enumerable.TipoLocalidade;
import com.ucan.plataformadenuncias.repositories.*;
import org.apache.poi.ss.usermodel.IconMultiStateFormatting;
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
    private final ContaPerfilRepository contaPerfilRepository;

    private final TelefoneRepository telefoneRepository;

    private final GeneroRepository generoRepository;
    private final EstadoCivilRepository estadoCivilRepository;
    private final VersaoRepository versaoRepository;
    private final LocalidadeRepository localidadeRepository;

    public DataLoader(PessoaRepository pessoaRepository,
                      FuncionalidadeRepository funcionalidadeRepository,
                      FuncionalidadePerfilRepository funcionalidadePerfilRepository,
                      PerfilRepository perfilRepository,
                      ContaRepository contaRepository, ContaPerfilRepository contaPerfilRepository,
                      TelefoneRepository telefoneRepository,
                      GeneroRepository generoRepository,
                      EstadoCivilRepository estadoCivilRepository,
                      VersaoRepository versaoRepository,
                      LocalidadeRepository localidadeRepository) {

        this.pessoaRepository = pessoaRepository;
        this.funcionalidadeRepository = funcionalidadeRepository;
        this.funcionalidadePerfilRepository = funcionalidadePerfilRepository;
        this.perfilRepository = perfilRepository;
        this.contaRepository = contaRepository;
        this.contaPerfilRepository = contaPerfilRepository;
        this.telefoneRepository = telefoneRepository;
        this.generoRepository = generoRepository;
        this.estadoCivilRepository = estadoCivilRepository;
        this.versaoRepository = versaoRepository;
        this.localidadeRepository = localidadeRepository;

    }

    @Override
    public void run(String... args) throws Exception {

        generoRepository.save(new Genero(1, "Masculino"));
        generoRepository.save(new Genero(2, "Feminino"));

        estadoCivilRepository.save(new EstadoCivil(1, "SOLTEIRO"));
        estadoCivilRepository.save(new EstadoCivil(2, "CASADO"));
        estadoCivilRepository.save(new EstadoCivil(3, "DIVORCIADO"));
        estadoCivilRepository.save(new EstadoCivil(4, "VIUVO"));
        estadoCivilRepository.save(new EstadoCivil(5, "UNIAO_DE_FACTO"));

        // jwt -> autenticação hierarquica

        Localidade localidade = new Localidade();
        localidade.setNome("Luanda");
        localidade.setTipo(TipoLocalidade.RUA);
        localidade.setNomeRua("Porto Santo");

        localidade = localidadeRepository.save(localidade);

        Pessoa pessoa = new Pessoa();
        pessoa.setIdentificacao("AAABBBCCC");
        pessoa.setNome("Whitney Houston");
        LocalDate dataNascimento = LocalDate.now();
        pessoa.setDataNascimento(dataNascimento);
        pessoa.setFkGenero(new Genero(1));
        pessoa.setFkEstadoCivil(new EstadoCivil(1));
        pessoa.setLocalidade(localidade);

        Optional<Pessoa> pessoaExistente =
                pessoaRepository.findByIdentificacao(pessoa.getIdentificacao());

        if (pessoaExistente.isEmpty()) {
            pessoa = pessoaRepository.save(pessoa); // INSERT
        } else {
            pessoa = pessoaExistente.orElseThrow(); // entidade já persistida
        }

        Conta conta = contaRepository.findByEmail("whitney@gmail.com")
                .orElseGet(Conta::new);

        conta.setTipoConta(TipoContaEnum.ADMIN);
        conta.setFkPessoa(pessoa);
        conta.setEmail("whitney@gmail.com");
        conta.setPasswordHash("whitney");
        contaRepository.save(conta);

        Perfil perfil = new Perfil();
        perfil.setDescricao("ADMIN");
        perfil.setDesignacao("ADMIN");
        perfil.setCreatedAt(LocalDateTime.now());
        perfil.setUpdatedAt(LocalDateTime.now());
        perfilRepository.save(perfil);

        ContaPerfil contaPerfil = new ContaPerfil();
        contaPerfil.setFkConta(conta);
        contaPerfil.setFkPerfil(perfil);

        contaPerfilRepository.save(contaPerfil);

        //--------------------------- II User -------------------------------
        pessoa = new Pessoa();
        pessoa.setIdentificacao("1234asdewq");
        pessoa.setNome("Carlos Burity");
        dataNascimento = LocalDate.now();
        pessoa.setDataNascimento(dataNascimento);
        pessoa.setFkGenero(new Genero(1));
        pessoa.setFkEstadoCivil(new EstadoCivil(1));
        pessoa.setLocalidade(localidade);

        pessoa = pessoaRepository.save(pessoa);

        conta = new Conta();
        conta.setTipoConta(TipoContaEnum.ADMIN_SECTORIAL);
        conta.setFkPessoa(pessoa);
        conta.setEmail("carlosburity@gmail.com");
        conta.setPasswordHash("carlosburity");
        contaRepository.save(conta);

        perfil = new Perfil();
        perfil.setDescricao("ADMIN_SECTORIAL");
        perfil.setDesignacao("ADMIN_SECTORIAL");
        perfil.setCreatedAt(LocalDateTime.now());
        perfil.setUpdatedAt(LocalDateTime.now());
        perfilRepository.save(perfil);

        contaPerfil = new ContaPerfil();
        contaPerfil.setFkPerfil(perfil);
        contaPerfil.setFkConta(conta);

        contaPerfilRepository.save(contaPerfil);


        Versao versao = new Versao();
        versao.setData(Calendar.getInstance().getTime());
        versao.setNomeTabela("tipo_funcionalidade");
        versao.setDescricao("versao 1");

        versaoRepository.save(versao);

        Versao versao2 = new Versao();
        versao2.setData(Calendar.getInstance().getTime());
        versao2.setNomeTabela("funcionalidade");
        versao2.setDescricao("versão 1");

        versaoRepository.save(versao2);

    }

}