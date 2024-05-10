package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import user.entity.User;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class LankHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String orderBy = queryParams.getOrDefault("type", "BEST");

            List<Object[]> results = entityManager.createQuery(
                            "SELECT u, COUNT(c.ending) as cnt " +
                                    "FROM User u LEFT JOIN u.collectionList c " +
                                    "GROUP BY u.id " +
                                    "ORDER BY cnt DESC", Object[].class)
                    .getResultList();

//            List<User> users = entityManager.createQuery("from User", User.class).getResultList();
//            StringBuilder sb = new StringBuilder();
//            for (User user : users) {
//                sb.append(user.getId()).append("\n");
//            }
//            entityManager.getTransaction().commit();

            //String jsonResponse = gson.toJson(responseMap);
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            //response.setBody(jsonResponse);

            return response;
        } finally {
            entityManager.close();
        }
    }
}
