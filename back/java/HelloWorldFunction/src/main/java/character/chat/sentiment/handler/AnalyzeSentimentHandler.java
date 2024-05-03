package character.chat.sentiment.handler;

import character.chat.sentiment.service.DetectSentimentService;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import org.json.JSONObject;

import java.util.Map;

public class AnalyzeSentimentHandler implements RequestHandler<Map<String, Object>, String> {

    @Override
    public String handleRequest(Map<String, Object> requestObject, Context context) {
        String sourceText = (String) requestObject.get("source_text");
        context.getLogger().log("Extracted text: " + sourceText);
        DetectSentimentService detectSentimentService = new DetectSentimentService();
        JSONObject jsonOb = detectSentimentService.detectSentiments(sourceText);
        context.getLogger().log("JSON: " + jsonOb.optString("sentiment", "No sentiment found"));
        return jsonOb.optString("sentiment", "No sentiment found");
    }
}
