package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.amazonaws.services.lambda.runtime.events.SQSEvent.SQSMessage;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import org.json.JSONObject;

public class TokenHandler implements RequestHandler<SQSEvent, Void> {

    private static EntityManagerFactory entityManagerFactory;

    static {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
        } catch (Throwable ex) {
            System.err.println("EntityManagerFactory 생성 중 예외 발생: " + ex);
            throw ex;
        }
    }

    @Override
    public Void handleRequest(SQSEvent event, Context context) {
        context.getLogger().log("Received event: " + event);

        for (SQSMessage msg : event.getRecords()) {
            String body = msg.getBody();
            context.getLogger().log("Message Body: " + body);

            JSONObject bodyJson = new JSONObject(body);
            String githubToken = bodyJson.getString("token");

            EntityManager entityManager;
            Long userId = null;
            String githubUsername = "", nickname = "", profileImg = "";

            // GitHub API를 이용하여 사용자 정보 가져오기
            try {
                String userInfo = fetchGitHubUserInfo(githubToken);
                context.getLogger().log("GitHub User Info: " + userInfo);

                JSONObject userInfoJson = new JSONObject(userInfo);
                userId = userInfoJson.getLong("id");
                githubUsername = userInfoJson.getString("login");
                nickname = userInfoJson.optString("name", githubUsername);
                profileImg = userInfoJson.getString("avatar_url");

            } catch (Exception e) {
                context.getLogger().log("Error fetching GitHub user info: " + e.getMessage());
            }

            entityManager = entityManagerFactory.createEntityManager();
            try {
                entityManager.getTransaction().begin();

                // 만약 userId로 이미 등록된 사용자가 있다면, Token을 업데이트
                // 쿼리 실행하여 사용자 수를 BigInteger로 받기
                BigInteger countResult = (BigInteger) entityManager.createNativeQuery("SELECT COUNT(*) FROM user WHERE id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();

                // BigInteger를 long 타입으로 변환
                long count = countResult.longValue();

                if(count > 0) {
                    context.getLogger().log("User Sign-in !!!");
                    updateUser(entityManager, userId, githubToken);
                } else {
                    context.getLogger().log("User Sign-up !!!");
                    insertUser(entityManager, userId, nickname, profileImg, githubUsername, githubToken);
                }
                entityManager.getTransaction().commit();
            } catch (Exception e) {
                context.getLogger().log("Database Error !! : " + e.getMessage());
                if (entityManager.getTransaction().isActive()) {
                    entityManager.getTransaction().rollback();
                }
            } finally {
                entityManager.close();
            }
        }
        return null;
    }

    private String fetchGitHubUserInfo(String githubToken) throws Exception {

        URL url = new URL("https://api.github.com/user");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "token " + githubToken);
        conn.setRequestProperty("Accept", "application/vnd.github+json");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return response.toString();
    }

    public void insertUser(EntityManager entityManager, Long id, String nickname, String profileImg, String githubUsername, String githubToken) {
        entityManager.createNativeQuery("INSERT INTO user (id, nickname, profile_img, github_username, github_token) VALUES (:id, :nickname, :profileImg, :githubUsername, :githubToken)")
            .setParameter("id", id)
            .setParameter("nickname", nickname)
            .setParameter("profileImg", profileImg)
            .setParameter("githubUsername", githubUsername)
            .setParameter("githubToken", githubToken)
            .executeUpdate();
    }

    public void updateUser(EntityManager entityManager, Long id, String githubToken) {
        entityManager.createNativeQuery(
                "UPDATE user SET github_token = :githubToken WHERE id = :id")
            .setParameter("id", id)
            .setParameter("githubToken", githubToken)
            .executeUpdate();
    }

}
