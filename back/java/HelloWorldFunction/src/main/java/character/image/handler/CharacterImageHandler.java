package character.image.handler;

import character.image.service.BedrockRuntimeUsageDemo;
import character.image.service.Translate;
import chat.service.AnalyzeSentimentService;
import software.amazon.awssdk.services.bedrockruntime.model.ValidationException;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CharacterImageHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();

        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");

        try {
            // String userInput = (String) request.get("userInput");
            String jsonBody = request.getBody();

            // JSON 객체로 변환
            Gson gson = new Gson();
            JsonObject obj = gson.fromJson(jsonBody, JsonObject.class);
            String userInput = obj.getAsJsonPrimitive("userInput").getAsString();
            String text = Translate.translate(userInput);
            String url = BedrockRuntimeUsageDemo.textToImage(text);

            if(url.isEmpty() || url == null){
                response.setStatusCode(500);
            } else {
                response.setStatusCode(200);
                response.setBody(createJsonResponse("imageUrl", url));
            }
        } catch (ValidationException ve) {
            context.getLogger().log("Validation error: " + ve.getMessage());
            response.setStatusCode(400);
            response.setBody(createJsonResponse("body", "Content blocked by AWS Responsible AI Policy."));
        } catch (Exception e) {
            context.getLogger().log("Error generating image: " + e.getMessage());
            response.setStatusCode(500);
            response.setBody(createJsonResponse("body", "Image generation failed"));
        }
        response.setHeaders(headers);
        return response;
    }

    private String createJsonResponse(String key, String value) {
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty(key, value);
        return new Gson().toJson(responseJson);
    }
}