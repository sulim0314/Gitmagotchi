package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import org.json.JSONObject;

import javax.persistence.*;
import java.util.*;

public class RankMeHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String type = queryParams.getOrDefault("type", "BEST");

            JSONObject requestObj = new JSONObject(request);
            JSONObject requestContext = requestObj.getJSONObject("requestContext");
            JSONObject authorizer = requestContext.getJSONObject("authorizer");
            JSONObject claims = authorizer.getJSONObject("claims");
            // username: github_125880884
            String username = claims.getString("cognito:username");
            String userId = username.replace("github_", "");
            // String userId = "111184269";

            System.out.println("####################");
            System.out.println("requestContext: " + requestContext);
            System.out.println("authorizer: " + authorizer);
            System.out.println("claims: " + claims);
            System.out.println("username: " + username);
            System.out.println("userId: " + userId);

            String queryStr;
            if ("BEST".equals(type)) {
                queryStr = "SELECT u.id, COUNT(u.id) as collection_count, RANK() OVER (ORDER BY COUNT(u.id) DESC) as user_rank " +
                        "FROM user u JOIN collection c ON c.user_id = u.id " +
                        "WHERE c.ending = 'INDEPENDENT'" +  // userId 파라미터 포함
                        "GROUP BY u.id";
            } else {
                queryStr = "SELECT u.id, COUNT(u.id) as collection_count, RANK() OVER (ORDER BY COUNT(u.id) DESC) as user_rank " +
                        "FROM user u JOIN collection c ON c.user_id = u.id " +
                        "WHERE c.ending IN ('SICK', 'RUNAWAY', 'HUNGRY')" +  // userId 파라미터 포함
                        "GROUP BY u.id";
            }
            Query rankQuery = entityManager.createNativeQuery(queryStr);
            List<Object[]> results = rankQuery.getResultList();

            entityManager.getTransaction().commit();
            entityManager.close();

            int userIdInt = Integer.valueOf(userId);

            Map<String, Object> responseMap = new HashMap<>();
            Map<String, String> headers = new HashMap<>();
            Object[] selectedUser = null;

            int a = 0;

            for (Object[] result : results) {
                System.out.println("#################");
                System.out.println("result: " + result[0] + ", userId: " + userId);
                if (result[0] instanceof Integer) {  // result[0]이 Integer 인스턴스인지 확인
                    int resultId = (Integer) result[0];  // 안전하게 Integer로 캐스팅
                    a = resultId;
                    if (resultId == userIdInt) {  // Integer 간의 비교
                        selectedUser = result;
                        break;
                    }
                }
            }

            if (selectedUser != null) {
                responseMap.put("id", selectedUser[0]);
                responseMap.put("collectionCount", selectedUser[1]);
                responseMap.put("rank", selectedUser[2]);
                headers.put("Access-Control-Allow-Origin", "*");
            } else {
                responseMap.put("message", "순위에 없음");
            }

            String jsonResponse = gson.toJson(responseMap);
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);

            JSONObject responseJson = new JSONObject();
            responseJson.put("statusCode", 200);
            responseJson.put("body", jsonResponse);
            response.setBody(responseJson.toString());
            response.setHeaders(headers);

            return response;
        } finally {
            entityManager.close();
        }
    }
}
