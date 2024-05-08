package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;
import org.json.JSONObject;
import user.entity.User;

public class AuthHandler implements RequestHandler<SQSEvent, Void> {

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
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();

        for (SQSEvent.SQSMessage msg : event.getRecords()) {
            String body = msg.getBody();
            context.getLogger().log("Message Body: " + body);

            JSONObject bodyJson = new JSONObject(body);
            Long userId = bodyJson.getLong("userId");
            String githubUsername = bodyJson.getString("githubUsername");
            String nickname = bodyJson.getString("nickname");
            String profileImg = bodyJson.getString("profileImg");

            EntityManager entityManager = entityManagerFactory.createEntityManager();
            try {
                entityManager.getTransaction().begin();
                // User 테이블에 user_id가 이미 존재하는지 확인
                TypedQuery<Long> query = entityManager.createQuery(
                    "SELECT COUNT(u) FROM User u WHERE u.id = :userId", Long.class);
                query.setParameter("userId", userId);
                Long count = query.getSingleResult();

                if (count > 0) { // 로그인
                    context.getLogger().log("User Sign-in !!!");
                } else { // 회원가입
                    context.getLogger().log("User Sign-up !!!");

                    // User 테이블에 사용자 정보 삽입
                    User newUser = new User();
                    newUser.setId(userId);
                    newUser.setNickname(nickname);
                    newUser.setProfile_img(profileImg);
                    newUser.setGithub_username(githubUsername);

                    entityManager.persist(newUser);
                    context.getLogger().log("User created successfully !!");
                }
                entityManager.getTransaction().commit();
            } catch (Exception e) {
                context.getLogger().log("Database Error !! : " + e.getMessage());
                if (entityManager.getTransaction().isActive()) {
                    entityManager.getTransaction().rollback();
                }
                response.setStatusCode(500);
            } finally {
                entityManager.close();
            }
        }
        return null;
    }
}
