package ru.croc.ctp.demo.datasources;

import javax.persistence.EntityManager;

public class DataSourcesQueries {
    private EntityManager entityManager;

    public DataSourcesQueries(EntityManager entityManager) {
        super();
        this.entityManager = entityManager;
    }

}
