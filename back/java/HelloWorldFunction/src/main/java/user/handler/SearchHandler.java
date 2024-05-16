package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import user.dto.UserResponseDto;
import user.entity.User;

import javax.persistence.*;
import java.util.*;

public class SearchHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String keyword = queryParams.getOrDefault("keyword", "");

            //페이징 처리
            String pageStr = queryParams.get("page");
            if (pageStr == null || pageStr.trim().isEmpty()) {
                pageStr = "1";
            }
            int page = Integer.parseInt(pageStr) - 1;

            String sizeStr = queryParams.get("pageSize");
            if (sizeStr == null || sizeStr.trim().isEmpty()) {
                sizeStr = "9";
            }
            int size = Integer.parseInt(sizeStr);

            String queryStr = "SELECT u FROM User u WHERE 1 = 1";
            String countQueryStr = "SELECT COUNT(DISTINCT u) FROM User u WHERE 1 = 1";  // 전체 항목 수를 계산하는 쿼리

            if (keyword != null && !keyword.isEmpty()) {
                queryStr += " AND u.nickname LIKE :keyword";
                countQueryStr += " AND u.nickname LIKE :keyword";
            }

            Query countQuery = entityManager.createQuery(countQueryStr);
            TypedQuery<User> query = entityManager.createQuery(queryStr, User.class);
            query.setFirstResult(page * size); // 설정: 첫번째 결과의 인덱스
            query.setMaxResults(size);         // 설정: 최대 결과 수

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", '%' + keyword + '%'); // LIKE 파라미터 설정
                countQuery.setParameter("keyword", '%' + keyword + '%');
            }

            long totalElements = (long) countQuery.getSingleResult();
            List<User> users = query.getResultList();

            List<UserResponseDto> responseDtos = users.stream().map(user ->
                    UserResponseDto.builder()
                            .id(user.getId())
                            .profileImg(user.getProfileImg())
                            .nickname(user.getNickname())
                            .githubToken(user.getGithubToken())
                            .githubUsername(user.getGithubUsername())
                            .gold(user.getGold())
                            .meal(user.getMeal())
                            .backgroundId(user.getBackgroundId())
                            .characterId(user.getCharacterId())
                            .build()
            ).toList();

            //출력 테스트
            StringBuilder sb = new StringBuilder();
            for (User user : users) {
                sb.append(user.getId()).append("\n");
            }

            entityManager.getTransaction().commit();
            entityManager.close();

            Map<String, Object> paginationInfo = new HashMap<>();
            paginationInfo.put("page", page + 1);
            paginationInfo.put("pageSize", size);
            paginationInfo.put("totalElements", totalElements);
            paginationInfo.put("totalPages", (int) Math.ceil((double) totalElements / size));

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("content", responseDtos);
            responseMap.put("pageable", paginationInfo);

            String jsonResponse = gson.toJson(responseMap);
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            response.setBody(jsonResponse);
            return response;
        } finally {
            entityManager.close();
        }
    }
}
