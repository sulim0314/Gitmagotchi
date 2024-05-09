package chat.handler;

import chat.service.AnalyzeSentimentService;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.json.JSONObject;

import java.util.Map;

public class AnalyzeSentimentHandler implements RequestHandler<Map<String, Object>, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(Map<String, Object> requestObject, Context context) {
        String sourceText = (String) requestObject.get("body");
        context.getLogger().log("Extracted text: " + sourceText);
        AnalyzeSentimentService detectSentimentService = new AnalyzeSentimentService();
        JSONObject jsonOb = detectSentimentService.detectSentiments(sourceText);
        context.getLogger().log("JSON: " + jsonOb.optString("sentiment", "No sentiment found"));
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(200);
        response.setBody(jsonOb.optString("sentiment", "No sentiment found"));
        return response;
    }
}
