package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.json.JSONObject;
import redis.clients.jedis.Jedis;
import user.dto.MealResponseDto;


public class GetMealHandler implements
    RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static EntityManagerFactory entityManagerFactory;
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    static {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
        } catch (Throwable ex) {
            System.err.println("EntityManagerFactory 생성 중 예외 발생: " + ex);
            throw ex;
        }
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request,
        Context context) {

        HashMap<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setHeaders(headers);

        JSONObject requestObj = new JSONObject(request);
        JSONObject requestContext = requestObj.getJSONObject("requestContext")
            .getJSONObject("authorizer").getJSONObject("claims");
        String username = requestContext.getString("cognito:username");
        Integer userId = Integer.parseInt(username.replace("github_", ""));

        context.getLogger().log("userId================: " + userId);

        EntityManager entityManager = entityManagerFactory.createEntityManager();
        MealResponseDto mealResponse = getMealRes(entityManager, userId);
        entityManager.close();

        LocalDateTime lastTime = mealResponse.getLastTime();
        String githubUsername = mealResponse.getGithubUsername();
        Integer curMeal = mealResponse.getMeal();
        String githubToken = mealResponse.getGithubToken();

        // 하루에 밥 짓기 3번 제한
        String redisHost = System.getenv("REDIS_HOST");
        int redisPort = Integer.parseInt(System.getenv("REDIS_PORT"));
        Jedis jedis = new Jedis(redisHost, redisPort);

        try {
            if (jedis.exists(String.valueOf(userId))) {
                Integer n = Integer.parseInt(jedis.get(String.valueOf(userId)));
                if (n >= 3) {
                    JSONObject bodyJson = new JSONObject();
                    bodyJson.put("message", "밥 짓기는 하루에 3번만 가능합니다.");
                    bodyJson.put("value", 0);

                    JSONObject responseJson = new JSONObject();
                    responseJson.put("statusCode", 200);
                    responseJson.put("body", bodyJson.toString());
                    response.setBody(responseJson.toString());
                    return response;
                }
            }
        } catch (Exception e) {
            context.getLogger().log("Redis connection error: " + e.getMessage());
            throw e;
        }

        try {
            // 사용자의 전체 레포 목록 조회
            String reposUrl = "https://api.github.com/user/repos";
            HttpRequest reposRequest = HttpRequest.newBuilder()
                .uri(URI.create(reposUrl))
                .header("Authorization", "Bearer " + githubToken)
                .build();
            HttpResponse<String> reposResponse = httpClient.send(reposRequest,
                HttpResponse.BodyHandlers.ofString());
            List<Map<String, Object>> repos = gson.fromJson(reposResponse.body(),
                new TypeToken<List<Map<String, Object>>>() {
                }.getType());

            // 레포별로 사용자 본인이 커밋한 커밋 기록 조회 및 현재 시각과 비교해서 커밋 개수 세기
            int totalCommitsAfterLastMeal = 0;

            for (Map<String, Object> repo : repos) {
                if (totalCommitsAfterLastMeal >= 3) {
                    break; // 총 커밋 수가 3 이상인 경우 반복 중지
                }
                String repoName = (String) repo.get("name");
                URL url = new URL("https://api.github.com/repos/" + githubUsername + "/" + repoName
                    + "/commits?author=" + githubUsername + "&per_page=5&page=1");
                HttpRequest commitRequest = HttpRequest.newBuilder()
                    .uri(url.toURI())
                    .header("Authorization", "Bearer " + githubToken)
                    .build();

                HttpResponse<String> commitResponse = httpClient.send(commitRequest,
                    HttpResponse.BodyHandlers.ofString());

                JsonElement jsonElement = gson.fromJson(commitResponse.body(), JsonElement.class);
                List<Map<String, Object>> commits = null;

                if (jsonElement.isJsonArray()) {
                    // 배열로 처리
                    context.getLogger().log("commitResponse================: " + commitResponse.body());
                    context.getLogger().log("jsonElement.isJsonArray() 배열로 처리");
                    commits = gson.fromJson(commitResponse.body(),
                        new TypeToken<List<Map<String, Object>>>() {
                        }.getType());
                } else if (jsonElement.isJsonObject()) {
                    // 객체로 처리
                    // 예외 처리나 다른 로직 구현
                    context.getLogger().log("commitResponse================: " + commitResponse.body());
                    context.getLogger().log("jsonElement.isJsonObject() 객체로 처리");
                }

                if (commits == null || commits.isEmpty()) {
                    context.getLogger().log("No commits or commits is null");
                    continue; // 다음 레포로 넘어간다
                }

                for (Map<String, Object> commit : commits) {
                    if (totalCommitsAfterLastMeal >= 3) {
                        break; // 총 커밋 수가 3 이상인 경우 반복 중지
                    }

                    if (commit == null) {
                        context.getLogger().log("commit is null");
                        continue;
                    }

                    Map<String, Object> commitInfo = (Map<String, Object>) commit.get("commit");
                    Map<String, String> authorInfo = (Map<String, String>) commitInfo.get("author");
                    String commitDateStr = authorInfo.get("date");

                    ZonedDateTime zdt = ZonedDateTime.parse(commitDateStr);
                    LocalDateTime commitDate = zdt.toLocalDateTime();

                    if (commitDate.isAfter(lastTime)) {
                        totalCommitsAfterLastMeal++;
                    }
                }
            }

            Integer alreadyCommit = Integer.parseInt(jedis.get(String.valueOf(userId)));

            JSONObject bodyJson = new JSONObject();
            bodyJson.put("message", "처리 완료");
            if(alreadyCommit + totalCommitsAfterLastMeal > 3) {
                bodyJson.put("value", Math.abs(3 - alreadyCommit));
            } else {
                bodyJson.put("value", totalCommitsAfterLastMeal);
            }
            JSONObject responseJson = new JSONObject();
            responseJson.put("statusCode", 200);
            responseJson.put("body", bodyJson.toString());
            response.setBody(responseJson.toString());

            context.getLogger().log("totalCommitsAfterLastMeal================: " + totalCommitsAfterLastMeal);

            if (jedis.exists(String.valueOf(userId))) {
                if(alreadyCommit + totalCommitsAfterLastMeal > 3) {
                    jedis.incrBy(String.valueOf(userId), Math.abs(3 - alreadyCommit));
                } else {
                    jedis.incrBy(String.valueOf(userId), totalCommitsAfterLastMeal);
                }
            } else {
                jedis.setex(String.valueOf(userId), 86400, String.valueOf(totalCommitsAfterLastMeal));
            }

            jedis.close();

            // meal update, last_time update
            entityManager = entityManagerFactory.createEntityManager();
            entityManager.getTransaction().begin();
            updateMealCount(entityManager, userId, curMeal + totalCommitsAfterLastMeal);
            entityManager.getTransaction().commit();

        } catch (IOException | InterruptedException e) {
            if (entityManager != null) {
                entityManager.getTransaction().rollback();
            }
            e.printStackTrace();
            // 예외 처리
            response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(500);
            response.setBody("서버 에러 발생");
            return response;
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        } finally {
            if (entityManager != null) {
                entityManager.close();
            }
        }
        return response;
    }

    // user테이블에서 id로 last_time,github_username, github_token, meal 반환
    public MealResponseDto getMealRes(EntityManager entityManager, Integer userId) {
        List<Object[]> results = entityManager.createNativeQuery(
                "SELECT last_time, github_username, github_token, meal FROM user WHERE id = :userId")
            .setParameter("userId", userId)
            .getResultList();

        Object[] result = results.get(0);

        return MealResponseDto.builder()
            .lastTime(((java.sql.Timestamp) result[0]).toLocalDateTime())
            .githubUsername((String) result[1])
            .githubToken((String) result[2])
            .meal((Integer) result[3])
            .build();
    }

    public void updateMealCount(EntityManager entityManager, Integer userId,
        Integer afterMealCount) {
        entityManager.createNativeQuery(
                "UPDATE user SET meal = :afterMealCount, last_time = :updatedTime WHERE id = :userId")
            .setParameter("afterMealCount", afterMealCount)
            .setParameter("userId", userId)
            .setParameter("updatedTime", LocalDateTime.now())
            .executeUpdate();
    }

}
