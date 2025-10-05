package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.entities.Localidade;
import com.ucan.plataformadenuncias.repositories.LocalidadeRepository;
import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LocalidadeService {

    public static boolean localidadesInitialized = false;

    private static HashMap<Integer, Localidade> localidadesByPkLocalidadeCache;
    private static List<Localidade> localidades;
    private static Comparator<Localidade> comparadorLocalidades;
    private static Comparator<Localidade> comparadorLocalidadesIndefinidas;

    public final String INDEFINIDO = "Indefinido";
    public final String INDEFINIDA = "Indefinida";

    
    private final LocalidadeRepository localidadeRepository;

    public LocalidadeService(LocalidadeRepository localidadeRepository) {
        this.localidadeRepository = localidadeRepository;
    }

    @PostConstruct
    public void init() {
        System.out.println("Running startup task...");
        if (localidadeRepository.count() == 0) {
            initializeLocalidades();
        }
        initLocalidadesCache();
        localidadesInitialized = true;
    }

    private void initializeLocalidades() {
        List<Sitio> sitios = Arrays.asList(
            new Sitio("Africa"),
            new Sitio("America"),
            new Sitio("Europa"),
            new Sitio("Asia"),
            new Sitio("Indefinido"),
            new Sitio("Angola", "Africa"),
            new Sitio("Mocambique", "Africa"),
            new Sitio("Luanda", "Angola", "Africa"),
            new Sitio("Cabinda", "Angola", "Africa"),
            new Sitio("Indefinida", "Angola", "Africa"),
            new Sitio("Belas", "Luanda", "Angola"),
            new Sitio("Cacuaco", "Luanda", "Angola"),
            new Sitio("Indefinido", "Luanda", "Angola")
        );

        this.saveAll(sitios);
    }

    private void saveAll(List<Sitio> sitios) {
        for (Sitio s : sitios) {
            Localidade loc = generateLocalidade(s);
            this.localidadeRepository.save(loc);
        }
    }

    public Localidade generateLocalidade(Sitio s) {
        Localidade loc = new Localidade(s.getNome());
        String pai = s.getPai();
        String avo = s.getAvo();

        loc.setFkLocalidadePai(
            pai == null ? null :
                (avo == null
                        ? this.localidadeRepository.findByNome(pai)
                        : this.localidadeRepository.findByNomeAndFkLocalidadePai_Nome(pai, avo))
        );
        return loc;
    }

    private void initLocalidadesCache() {
        localidadesByPkLocalidadeCache = new HashMap<>();
        localidades = this.localidadeRepository.findAll();

        for (Localidade l : localidades) {
            localidadesByPkLocalidadeCache.put(l.getPkLocalidade(), l);
        }

        comparadorLocalidades = (l1, l2) -> l1.getNome().compareToIgnoreCase(l2.getNome());

        comparadorLocalidadesIndefinidas = (s1, s2) -> {
            if (s1.getFkLocalidadePai() == null) return 1;
            if (s2.getFkLocalidadePai() == null) return -1;
            return s1.getFkLocalidadePai().getNome()
                     .compareToIgnoreCase(s2.getFkLocalidadePai().getNome());
        };

        Collections.sort(localidades, comparadorLocalidades);
    }

    // classe interna Sitio igual ao teu código
     private static class Sitio {
        private String nome;
        private String pai;
        private String avo;

        public Sitio(String nome) {
            this.nome = nome;
        }

        public Sitio(String nome, String pai) {
            this.nome = nome;
            this.pai = pai;
        }

        public Sitio(String nome, String pai, String avo) {
            this.nome = nome;
            this.pai = pai;
            this.avo = avo;
        }

        public String getNome() { return nome; }
        public String getPai() { return pai; }
        public String getAvo() { return avo; }

        @Override
        public String toString() {
            return "Sitio{" + "nome=" + nome + ", pai=" + pai + ", avo=" + avo + '}';
        }
    }
}
