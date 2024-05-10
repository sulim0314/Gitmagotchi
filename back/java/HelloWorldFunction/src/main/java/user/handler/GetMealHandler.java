package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import user.dto.MealResponseDto;


public class GetMealHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

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

    static String githubToken = "Bearer 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";
    static Long userId = 125880884L;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = null;

        context.getLogger().log("1111111111111111111");

        APIGatewayProxyResponseEvent response = null;
        try {
            // 사용자의 전체 레포 목록 조회
            String reposUrl = "https://api.github.com/user/repos";
            HttpRequest reposRequest = HttpRequest.newBuilder()
                .uri(URI.create(reposUrl))
                .header("Authorization", githubToken)
                .build();
            HttpResponse<String> reposResponse = httpClient.send(reposRequest,
                HttpResponse.BodyHandlers.ofString());
            List<Map<String, Object>> repos = gson.fromJson(reposResponse.body(),
                new TypeToken<List<Map<String, Object>>>() {
                }.getType());

            context.getLogger().log("2222222222222222222");

            entityManager = entityManagerFactory.createEntityManager();
            entityManager.getTransaction().begin();

            MealResponseDto mealResponse = getMealRes(entityManager, userId);

            context.getLogger().log("mealResponse: " + mealResponse);

            LocalDateTime lastTime = mealResponse.getLastTime();
            String githubUsername = mealResponse.getGithubUsername();

            context.getLogger().log("3333333333333333333");

            // 레포별로 사용자 본인이 커밋한 커밋 기록 조회 및 현재 시각과 비교해서 커밋 개수 세기
            int totalCommitsAfterLastMeal = 0;
            for (Map<String, Object> repo : repos) {
                String repoName = (String) repo.get("name");
                URL url = new URL("https://api.github.com/repos/" + githubUsername + "/" + repoName
                    + "/commits?author=" + githubUsername);
                HttpRequest commitRequest = HttpRequest.newBuilder()
                    .uri(url.toURI())
                    .header("Authorization", githubToken)
                    .build();
                HttpResponse<String> commitResponse = httpClient.send(commitRequest,
                    HttpResponse.BodyHandlers.ofString());
                List<Map<String, Object>> commits = gson.fromJson(commitResponse.body(),
                    new TypeToken<List<Map<String, Object>>>() {
                    }.getType());

                for (Map<String, Object> commit : commits) {
                    Map<String, String> commitAuthor = (Map<String, String>) commit.get("commit");
                    String commitDateStr = commitAuthor.get("date");
                    LocalDateTime commitDate = LocalDateTime.parse(commitDateStr);
                    if (commitDate.isAfter(lastTime)) {
                        totalCommitsAfterLastMeal++;
                    }
                }

                context.getLogger().log("4444444444444444444");

            }

            // 성공적으로 처리된 경우, 커밋 수를 응답에 포함
            response.setBody("처리 완료. 마지막 식사 이후 커밋 수: " + totalCommitsAfterLastMeal);

            // TODO: 마지막에 last_time 업데이트 !!!!!!!


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

    // user테이블에서 id로 last_time,github_username 반환
    public MealResponseDto getMealRes(EntityManager entityManager, Long userId) {
        List<Object[]> results = entityManager.createNativeQuery("SELECT last_time, github_username FROM user WHERE id = :userId")
            .setParameter("userId", userId)
            .getResultList();

        if (results.isEmpty()) {
            // 해당하는 사용자가 없는 경우, 적절한 예외 처리나 대응 필요
            return null;
        }

        Object[] result = results.get(0); // 결과가 항상 하나라고 가정

        return MealResponseDto.builder()
            .lastTime((LocalDateTime) result[0])
            .githubUsername((String) result[1])
            .build();
    }
}
