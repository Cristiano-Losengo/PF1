package com.ucan.plataformadenuncias.services;

import com.ucan.plataformadenuncias.config.DataUtils;
import com.ucan.plataformadenuncias.entities.Versao;
import com.ucan.plataformadenuncias.repositories.VersaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.temporal.TemporalField;
import java.util.Date;
import java.util.Optional;

@Service
public class VersaoService {

    @Autowired
    private VersaoRepository versaoRepository;

    public int comparaDataVersao(String tabelaNome, Date d)
    {
        //Optional<Versao> versaoOptional = this.versaoRepository.findbyDesignaçao(tabelaNome);

        Versao versaoOptional = this.versaoRepository.findByTable(tabelaNome);

        if (versaoOptional == null)
        {
            return 1;
        }
        else
        {
            Date dataVersao = versaoOptional.getData();
            return DataUtils.compare(d, dataVersao);
        }
    }

    public Versao updatedataVersao(String tabelaNome, Date d)
    {
        Optional<Versao> versaoOptional = this.versaoRepository.findById(tabelaNome);
        Versao versao = null;
        if (versaoOptional.isEmpty())
        {
            versao = new Versao(tabelaNome, d);
        }
        else
        {
            versao = versaoOptional.get();
            versao.setData(d);
        }
        return this.versaoRepository.save(versao);
    }

}
