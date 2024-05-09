package collection.handler;

import collection.dto.CollectionResponseDto;
import collection.entity.Collection;
import collection.enums.EndingType;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;
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

            if (keyword != null && !keyword.isEmpty()) {
                queryStr += " AND c.characterName LIKE :keyword";
            }

            if (isIndependent != null && !isIndependent.isEmpty()) {
                if (Boolean.parseBoolean(isIndependent)) {
                    queryStr += " AND c.ending = :endingType";
                } else {
                    queryStr += " AND c.ending IN (:nonIndependentTypes)";
                }
            }

            //임의로 params에서 userId 가져오기
            if(isCollection && userId != null && !userId.isEmpty()){
                queryStr += " AND c.user.id = :userId";
            }

            queryStr += " ORDER BY c.createdAt " + (orderBy.equals("OLDEST") ? "ASC" : "DESC");

            TypedQuery<Collection> query = entityManager.createQuery(queryStr, Collection.class);

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", '%' + keyword + '%'); // LIKE 파라미터 설정
            }

            if (isIndependent != null && !isIndependent.isEmpty()) {
                if (Boolean.parseBoolean(isIndependent)) {
                    query.setParameter("endingType", EndingType.INDEPENDENT);
                } else {
                    // INDEPENDENT가 아닌 모든 종류를 포함하도록 설정
                    query.setParameter("nonIndependentTypes", Arrays.asList(EndingType.HUNGRY, EndingType.SICK, EndingType.RUNAWAY));
                }
            }

            if(isCollection && userId != null && !userId.isEmpty()){
                query.setParameter("userId", Long.valueOf(userId));
            }

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

            String jsonResponse = gson.toJson(responseDtos);
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            response.setBody(jsonResponse);

            return response;
        } finally {
            entityManager.close();
        }
    }
}