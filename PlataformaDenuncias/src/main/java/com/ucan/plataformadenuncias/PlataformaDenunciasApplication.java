
package com.ucan.plataformadenuncias;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication( scanBasePackages = {

        "com.ucan.plataformadenuncias.config",
        "com.ucan.plataformadenuncias.controllers",
        "com.ucan.plataformadenuncias.dto",
        "com.ucan.plataformadenuncias.entities",
        "com.ucan.plataformadenuncias.enumerable",
        "com.ucan.plataformadenuncias.repositories",
        "com.ucan.plataformadenuncias.security",
        "com.ucan.plataformadenuncias.services",
        "com.ucan.plataformadenuncias.initializer"

})

public class PlataformaDenunciasApplication {

    public static void main(String[] args) {

        SpringApplication.run(PlataformaDenunciasApplication.class, args);

    }

}
