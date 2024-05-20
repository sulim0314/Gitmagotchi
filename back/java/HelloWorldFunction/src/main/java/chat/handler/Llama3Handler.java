package chat.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelWithResponseStreamResponseHandler;
import software.amazon.awssdk.services.bedrockruntime.model.ThrottlingException;

import java.util.HashMap;

public class Llama3Handler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    static String response;
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {

        String jsonBody = request.getBody();

        System.out.println("Request: " + request);

        System.out.println("Received body: " + jsonBody);
        // JSON 객체로 변환
//        JSONObject obj = new JSONObject(jsonBody);
//        JSONObject characterInfo = obj.getJSONObject("characterInfo");
//        String userInput = obj.getString("userInput");

        if (jsonBody == null || jsonBody.isEmpty()) {
            // 입력 데이터의 body 부분이 null이거나 비어있는 경우 처리
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody("Invalid input data");
        }

        // JSON 객체로 변환
        Gson gson = new Gson();
        JsonObject obj = gson.fromJson(jsonBody, JsonObject.class);
        JsonObject characterInfo = obj.getAsJsonObject("characterInfo");
        String userInput = obj.getAsJsonPrimitive("userInput").getAsString();
        String preChat = obj.getAsJsonPrimitive("chat").getAsString();

        JsonElement nameElement = characterInfo.get("name");
        JsonElement levelElement = characterInfo.get("level");
        JsonElement fullnessElement = characterInfo.get("fullness");
        JsonElement intimacyElement = characterInfo.get("intimacy");
        JsonElement cleanlinessElement = characterInfo.get("cleanliness");
        JsonElement intimacyMaxElement = characterInfo.get("intimacyMax");


        String name = nameElement.getAsString();
        int level = levelElement.getAsInt();
        int fullness = fullnessElement.getAsInt();
        int intimacy = intimacyElement.getAsInt();
        int cleanliness = cleanlinessElement.getAsInt();
        int intimacyMax = intimacyMaxElement.getAsInt();

        System.out.println("Request: " + userInput);
        System.out.println(" ");

        response = "(말 못함)";
        String languageType = " ";
        switch (level) {
            case 3:
            case 4: languageType = "5글자 이내의 단어를 한국어로 답해줘";
                break;
            case 5:
            case 6: languageType = "20글자 이내의 문장을 한국어로 답해줘";
                break;
            default: languageType = "100글자 이내의 문장을 한국어로 답해줘";
                break;
        }

//        String chat = """
//                사용자: 나 너무 배고파
//                캐릭터: 그럼 뭐 먹을까?
//                사용자: 너 뭐 좋아해?
//                캐릭터: 나는 햄버거 좋아해
//                """;

        // Define the user message to send.
        String prompt = String.format("""
        너는 지금부터 캐릭터가 되어 챗봇처럼 사용자와 대화를 하는 거야.
        챗봇처럼 사용자 입력에 대해 %s.
        아래의 캐릭터 정보와 이전 채팅 내용에 대해서는 직접적으로 언급하지 말아줘. \n
        한국어로 답해줘. 한국어로 답하는 거 명심해. \n
        대화 이외의 나머지 단어 및 문장들은 다 제거해줘.
        
        [캐릭터 정보]
        이름 : %s
        레벨 : %d
        포만감 : %d/100
        친밀도 : %d/%d
        청결도 : %d/100
        \n
        [이전 대화 내용]
        %s
        \n
        [사용자 입력 내용]
        %s
        \n
        
        """, languageType, name, level, fullness, intimacy, intimacyMax, cleanliness, preChat, userInput);

        if(level >=3){
            requestAPI(prompt);
        }

        System.out.println("Response: " + response);

        // 응답 구성
        APIGatewayProxyResponseEvent responseAPI = new APIGatewayProxyResponseEvent();
        responseAPI.setStatusCode(200);
        responseAPI.setHeaders(new HashMap<>() {{
            put("Content-Type", "application/json");
        }});
        responseAPI.setBody("\"" + response + "\"");

        return responseAPI;
    }

    public static void requestAPI(String prompt) {

        // Create a Bedrock Runtime client in the AWS Region of your choice.
        var client = BedrockRuntimeAsyncClient.builder()
                .region(Region.US_EAST_1)
                .build();

        // Set the model ID, e.g., Llama 3 8B Instruct.
        var modelId = "meta.llama3-70b-instruct-v1:0";

        // Create a JSON payload using the model's native structure.
        var request = new JSONObject()
                .put("prompt", prompt)
                // Optional inference parameters:
                .put("max_gen_len", 100)
                .put("temperature", 0.5F)
                .put("top_p", 0.9F);

        StringBuilder builder = new StringBuilder();

        try {
            // Create a handler to extract and print the response text in real-time.
            var streamHandler = InvokeModelWithResponseStreamResponseHandler.builder()
                    .subscriber(event -> event.accept(
                            InvokeModelWithResponseStreamResponseHandler.Visitor.builder()
                                    .onChunk(c -> {
                                        var chunk = new JSONObject(c.bytes().asUtf8String());
                                        if (chunk.has("generation")) {
                                            builder.append(chunk.getString("generation"));
                                        }
                                    }).build())
                    ).build();

            // Encode and send the request. Let the stream handler process the response.
            client.invokeModelWithResponseStream(req -> req
                    .body(SdkBytes.fromUtf8String(request.toString()))
                    .modelId(modelId), streamHandler
            ).join();

            String response1 = builder.toString().replaceAll("[\"\\n\\r]", "");
            String response2 = response1.replaceAll("```", "");
            response = response2.replaceAll("\\*.*?\\*", "");
        } catch (ThrottlingException e) {
            response = "지금은 말 할 기분이 아니에요..";
        }
    }
}
