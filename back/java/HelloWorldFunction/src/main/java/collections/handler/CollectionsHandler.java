package collections.handler;

import collections.entity.Collections;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.List;

public class CollectionsHandler implements RequestHandler<Object, String> {

    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");

    @Override
    public String handleRequest(Object input, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            List<Collections> employees = entityManager.createQuery("from Collections", Collections.class).getResultList();
            StringBuilder sb = new StringBuilder();
            for (Collections employee : employees) {
                sb.append(employee.getId()).append(" - ").append(employee.getId()).append("\n");
            }
            entityManager.getTransaction().commit();
            return sb.toString();
        } finally {
            entityManager.close();
        }
    }
}
