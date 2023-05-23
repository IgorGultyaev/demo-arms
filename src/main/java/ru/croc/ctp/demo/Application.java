package ru.croc.ctp.demo;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

import ru.croc.ctp.jxfw.core.config.XfwCoreConfig;
import ru.croc.ctp.jxfw.jpa.config.XfwJpaConfig;
import ru.croc.ctp.jxfw.wc.WebClientLoaderConfig;

@SpringBootApplication
@Import({XfwCoreConfig.class, WebClientLoaderConfig.class, XfwJpaConfig.class})
public class Application {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(Application.class, args);
    }

}