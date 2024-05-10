package collection.handler;

import collection.dto.CollectionResponseDto;
import collection.entity.Collection;
import collection.enums.EndingType;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

public class CollectionHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String keyword = queryParams.getOrDefault("keyword", "");
            Boolean isCollection = Boolean.parseBoolean(queryParams.getOrDefault("isCollection", "false"));
            String isIndependent = queryParams.getOrDefault("isIndependent", "");
            String orderBy = queryParams.getOrDefault("orderBy", "LATEST");

            String userId = queryParams.getOrDefault("userId", "");

            String queryStr = "SELECT c FROM Collection c WHERE 1 = 1";
            String countQueryStr = "SELECT COUNT(c) FROM Collection c WHERE 1 = 1";  // 전체 항목 수를 계산하는 쿼리

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

            if (keyword != null && !keyword.isEmpty()) {
                queryStr += " AND c.characterName LIKE :keyword";
                countQueryStr += " AND c.characterName LIKE :keyword";
            }

            if (isIndependent != null && !isIndependent.isEmpty()) {
                if (Boolean.parseBoolean(isIndependent)) {
                    queryStr += " AND c.ending = :endingType";
                    countQueryStr += " AND c.ending = :endingType";
                } else {
                    queryStr += " AND c.ending IN (:nonIndependentTypes)";
                    countQueryStr += " AND c.ending IN (:nonIndependentTypes)";
                }
            }

            //임의로 params에서 userId 가져오기
            if(isCollection && userId != null && !userId.isEmpty()){
                queryStr += " AND c.user.id = :userId";
                countQueryStr += " AND c.user.id = :userId";
            }

            queryStr += " ORDER BY c.createdAt " + (orderBy.equals("OLDEST") ? "ASC" : "DESC");

            Query countQuery = entityManager.createQuery(countQueryStr);
            TypedQuery<Collection> query = entityManager.createQuery(queryStr, Collection.class);
            query.setFirstResult(page * size); // 설정: 첫번째 결과의 인덱스
            query.setMaxResults(size);         // 설정: 최대 결과 수

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", '%' + keyword + '%'); // LIKE 파라미터 설정
                countQuery.setParameter("keyword", '%' + keyword + '%');
            }

            if (isIndependent != null && !isIndependent.isEmpty()) {
                if (Boolean.parseBoolean(isIndependent)) {
                    query.setParameter("endingType", EndingType.INDEPENDENT);
                    countQuery.setParameter("endingType", EndingType.INDEPENDENT);
                } else {
                    // INDEPENDENT가 아닌 모든 종류를 포함하도록 설정
                    query.setParameter("nonIndependentTypes", Arrays.asList(EndingType.HUNGRY, EndingType.SICK, EndingType.RUNAWAY));
                    countQuery.setParameter("nonIndependentTypes", Arrays.asList(EndingType.HUNGRY, EndingType.SICK, EndingType.RUNAWAY));
                }
            }

            if(isCollection && userId != null && !userId.isEmpty()){
                query.setParameter("userId", Integer.parseInt(userId));
                countQuery.setParameter("userId", Integer.parseInt(userId));
            }

            long totalElements = (long) countQuery.getSingleResult(); // 전체 항목 수 가져오기
            List<Collection> collections = query.getResultList();

            List<CollectionResponseDto> responseDtos = collections.stream().map(collection ->
                    CollectionResponseDto.builder()
                        .id(collection.getId())
                        .characterName(collection.getCharacterName())
                        .ending(collection.getEnding().toString()) // Enum 값을 문자열로 변환
                        .fullnessStat(collection.getFullnessStat())
                        .intimacyStat(collection.getIntimacyStat())
                        .cleannessStat(collection.getCleannessStat())
                        .characterUrl(collection.getCharacterUrl())
                        .build()
            ).collect(Collectors.toList());

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