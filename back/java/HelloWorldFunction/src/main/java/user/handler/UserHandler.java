package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import user.entity.User;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.List;

/** user ID 조회 **/
public class UserHandler implements RequestHandler<Object, String> {

    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");

    @Override
    public String handleRequest(Object input, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            List<User> users = entityManager.createQuery("from User", User.class).getResultList();
            StringBuilder sb = new StringBuilder();
            for (User user : users) {
                sb.append(user.getId()).append("\n");
            }
            entityManager.getTransaction().commit();
            return sb.toString();
        } finally {
            entityManager.close();
        }
    }
}
