package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import user.entity.User;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.List;

public class UserHandler implements RequestHandler<Object, String> {
    private static EntityManagerFactory entityManagerFactory;// = Persistence.createEntityManagerFactory("myPersistenceUnit");

    static {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
        } catch (Throwable ex) {
            System.err.println("EntityManagerFactory 생성 중 예외 발생: " + ex);
            throw ex;
        }
    }

    @Override
    public String handleRequest(Object input, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            List<User> employees = entityManager.createQuery("from User", User.class).getResultList();
            StringBuilder sb = new StringBuilder();
            for (User employee : employees) {
                sb.append(employee.getId()).append(" - ").append(employee.getId()).append("\n");
            }
            entityManager.getTransaction().commit();
            return sb.toString();
        } finally {
            entityManager.close();
        }
    }
}
