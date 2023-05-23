package ru.croc.ctp.demo;


import org.springframework.stereotype.Component;
import ru.croc.ctp.jxfw.wc.web.config.ConfigModuleModifier;
import ru.croc.ctp.jxfw.wc.web.config.XConfig;
import java.util.HashMap;
import java.util.Map;

@Component
public class ApplicationModuleConfig implements ConfigModuleModifier {

    @Override
    public XConfig createClientConfig(XConfig config) {

    	Map<String, Object> modules = config.getModules();
        if (modules == null) {
            modules = new HashMap<>();
        }

        Object filesObject = modules.get("files");
        @SuppressWarnings("unchecked")
        Map<String, Object> files = filesObject instanceof Map ? 
          (Map<String, Object>) filesObject : new HashMap<>();
        files.put("apiRoute", "api/_file");
        modules.put("files", files);
        config.setModules(modules);

        return config;
    }    

 }