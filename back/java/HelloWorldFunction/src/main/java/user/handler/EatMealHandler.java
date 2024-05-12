package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;


public class EatMealHandler implements
    RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static EntityManagerFactory entityManagerFactory;

    static {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
        } catch (Throwable ex) {
            System.err.println("EntityManagerFactory 생성 중 예외 발생: " + ex);
            throw ex;
        }
    }

    static Integer userId = 125880884; // TODO : userId를 어떻게 받아올까

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request,
        Context context) {

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        context.getLogger().log("1111111111111111111111");

        // userId로 현재 meal 가져오기
        Integer meal = getMeal(entityManager, userId);
        // meal이 0이면 error
        if (meal == 0) {
            response.setStatusCode(400);
            response.setBody("No meal left");
            return response;
        }

        context.getLogger().log("2222222222222222222222");

        // meal이 0이 아니면 meal - 1로 업데이트
        updateMeal(entityManager, userId, meal - 1);

        context.getLogger().log("3333333333333333333333");

        // 식사시 포만감 +15
        // status 테이블 fullness +15 (get하고 update)
        Integer fullness = getFullness(entityManager, userId);
        updateFullness(entityManager, userId, fullness + 15);

        // TODO : 하루 최대 +45

        context.getLogger().log("4444444444444444444444");

        // 경험치 +10
        // character 테이블 exp+10 (get하고 update)
        Integer exp = getExp(entityManager, userId);
        updateExp(entityManager, userId, exp + 10);

        context.getLogger().log("5555555555555555555555");

        entityManager.close();

        response.setStatusCode(200);
        response.setBody("Successfully eaten a meal");
        return response;
    }

    private Integer getMeal(EntityManager entityManager, Integer userId) {
        entityManager.getTransaction().begin();
        Integer meal = entityManager.createQuery("SELECT u.meal FROM User u WHERE u.id = :userId",
                Integer.class)
            .setParameter("userId", userId)
            .getSingleResult();
        entityManager.getTransaction().commit();
        return meal;
    }

    private void updateMeal(EntityManager entityManager, Integer userId, Integer meal) {
        entityManager.getTransaction().begin();
        entityManager.createQuery("UPDATE User u SET u.meal = :meal WHERE u.id = :userId")
            .setParameter("meal", meal)
            .setParameter("userId", userId)
            .executeUpdate();
        entityManager.getTransaction().commit();
    }

    private Integer getFullness(EntityManager entityManager, Integer userId) {
        entityManager.getTransaction().begin();
        Integer fullness = entityManager.createQuery(
                "SELECT s.fullness FROM Status s WHERE s.user_id = :userId",
                Integer.class)
            .setParameter("userId", userId)
            .getSingleResult();
        entityManager.getTransaction().commit();
        return fullness;
    }

    private void updateFullness(EntityManager entityManager, Integer userId, Integer fullness) {
        entityManager.getTransaction().begin();
        entityManager.createQuery(
                "UPDATE Status s SET s.fullness = :fullness WHERE s.user_id = :userId")
            .setParameter("fullness", fullness)
            .setParameter("userId", userId)
            .executeUpdate();
        entityManager.getTransaction().commit();
    }

    private Integer getExp(EntityManager entityManager, Integer userId) {
        entityManager.getTransaction().begin();
        Integer exp = entityManager.createQuery(
                "SELECT c.exp FROM Characters c WHERE c.user_id = :userId",
                Integer.class)
            .setParameter("userId", userId)
            .getSingleResult();
        entityManager.getTransaction().commit();
        return exp;
    }

    private void updateExp(EntityManager entityManager, Integer userId, Integer exp) {
        entityManager.getTransaction().begin();
        entityManager.createQuery("UPDATE Characters c SET c.exp = :exp WHERE c.user_id = :userId")
            .setParameter("exp", exp)
            .setParameter("userId", userId)
            .executeUpdate();
        entityManager.getTransaction().commit();
    }

}
