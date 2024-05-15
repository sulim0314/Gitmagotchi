package character.image.handler;

import character.image.service.BedrockRuntimeUsageDemo;
import chat.service.AnalyzeSentimentService;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

public class CharacterImageHandler implements RequestHandler<APIGatewayProxyRequestEvent, String> {

    @Override
    public String handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            // String userInput = (String) request.get("userInput");


            String jsonBody = request.getBody();

            // JSON 객체로 변환
            Gson gson = new Gson();
            JsonObject obj = gson.fromJson(jsonBody, JsonObject.class);

            String userInput = obj.getAsJsonPrimitive("userInput").getAsString();
            BedrockRuntimeUsageDemo.textToImage(userInput);
            return BedrockRuntimeUsageDemo.textToImage(userInput);
        } catch (IOException e) {
            context.getLogger().log("Error generating image: " + e.getMessage());
            return "Image generation failed";
        }
    }
}