package collection.handler;

import collection.entity.Collection;
import collection.enums.EndingType;
import collection.enums.OrderBy;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;
import java.util.*;

public class CollectionHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String keyword = queryParams.getOrDefault("keyword", "");
            Boolean isCollection = Boolean.parseBoolean(queryParams.getOrDefault("isCollection", "false"));
            String isIndependent = queryParams.get("isIndependent");
            String orderBy = queryParams.get("orderBy");

            String queryStr = "SELECT c FROM Collection c WHERE 1 = 1";

            if (keyword != null && !keyword.isEmpty()) {
                queryStr += " AND c.character_name LIKE :keyword";
            }

            if (isIndependent != null) {
                if (Boolean.parseBoolean(isIndependent)) {
                    queryStr += " AND c.ending = :endingType";
                } else {
                    queryStr += " AND c.ending IN (:nonIndependentTypes)";
                }
            }

            if (orderBy != null) {
                queryStr += " ORDER BY c.createdAt " + (orderBy.equals("LATEST") ? "DESC" : "ASC");
            }

            TypedQuery<Collection> query = entityManager.createQuery(queryStr, Collection.class);

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", '%' + keyword + '%'); // LIKE 파라미터 설정
            }

            if (isIndependent != null) {
                if (Boolean.parseBoolean(isIndependent)) {
                    query.setParameter("endingType", EndingType.INDEPENDENT);
                } else {
                    // INDEPENDENT가 아닌 모든 종류를 포함하도록 설정
                    query.setParameter("nonIndependentTypes", Arrays.asList(EndingType.HUNGRY, EndingType.SICK, EndingType.RUNAWAY));
                }
            }

            List<Collection> collections = query.getResultList();
            StringBuilder sb = new StringBuilder();
            for (Collection collection : collections) {
                sb.append(collection.getId()).append("\n");
            }
            entityManager.getTransaction().commit();

            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            response.setBody(sb.toString());
            return response;
        } finally {
            entityManager.close();
        }
    }

//    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
//
//    @Override
//    public String handleRequest(Object input, Context context) {
//        EntityManager entityManager = entityManagerFactory.createEntityManager();
//        try {
//            entityManager.getTransaction().begin();
//            List<Collection> employees = entityManager.createQuery("from Collection", Collection.class).getResultList();
//            StringBuilder sb = new StringBuilder();
//            for (Collection employee : employees) {
//                sb.append(employee.getId()).append("\n");
//            }
//            entityManager.getTransaction().commit();
//            return sb.toString();
//        } finally {
//            entityManager.close();
//        }
//    }
}
