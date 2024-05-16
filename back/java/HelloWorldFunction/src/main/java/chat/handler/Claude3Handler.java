// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package chat.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelWithResponseStreamRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelWithResponseStreamResponseHandler;
import software.amazon.awssdk.services.bedrockruntime.model.ResponseStream;

import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

public class Claude3Handler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        String jsonBody = request.getBody();  // 예시로 입력을 바로 사용합니다. 실제 상황에서는 필요에 따라 입력을 파싱하고 검증할 수 있습니다.

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
        JsonElement fullnessMaxElement = characterInfo.get("fullnessMax");
        JsonElement intimacyMaxElement = characterInfo.get("intimacyMax");
        JsonElement cleanlinessMaxElement = characterInfo.get("cleanlinessMax");

        String name = nameElement.getAsString();
        int level = levelElement.getAsInt();
        int fullness = fullnessElement.getAsInt();
        int intimacy = intimacyElement.getAsInt();
        int cleanliness = cleanlinessElement.getAsInt();
        int fullnessMax = fullnessMaxElement.getAsInt();
        int intimacyMax = intimacyMaxElement.getAsInt();
        int cleanlinessMax = cleanlinessMaxElement.getAsInt();

        String languageType;
        switch (level) {
            case 3:
            case 4: languageType = "4살 유치원생처럼 짧은 단어를 한국어로 답해줘. 10글자 이내로 답하는 거 명심해.";
                break;
            case 5:
            case 6: languageType = "8살 초등학생처럼 20글자 이내의 문장을 한국어로 답해줘. 20글자 이내인 거 명심해.";
                break;
            default: languageType = "20살 성인처럼 50글자 이내의 문장을 한국어로 답해줘. 50글자 이내인 거 명심해.";
                break;
        }

        System.out.println("###############");
        System.out.println(languageType);

        String prompt = String.format("""
        너는 캐릭터가 되어 사용자 입력에 대해 %s \n
        너와 사용자는 엄청 친한 사이니까 반말로 해줘. 반말로 하는 거 명심해. \n
        친근한 말투를 사용해주고, 상황에 맞는 이모티콘을 넣어도 돼. \n
        한국어로 답해줘. 한국어로 답하는 거 명심해. \n
        아래의 캐릭터 정보와 이전 채팅 내용에 대해서는 직접적으로 언급하지 말아줘. \n
        대화 이외의 나머지 단어 및 문장들은 다 제거해줘. \n
        
        [캐릭터 정보]
        이름 : %s
        레벨 : %d
        포만감 : %d/%d
        친밀도 : %d/%d
        청결도 : %d/%d
        \n
        [이전 대화 내용]
        %s
        \n
        [사용자 입력 내용]
        %s
        \n
        
        """, languageType, name, level, fullness, fullnessMax, intimacy, intimacyMax, cleanliness, cleanlinessMax, preChat, userInput);

        APIGatewayProxyResponseEvent responseAPI = new APIGatewayProxyResponseEvent();
        try {
            if(level >=3){
                JSONObject response = invokeModelWithResponseStream(prompt);
                String responseText = response.optJSONArray("content").optJSONObject(0).optString("text"); // 'content' 배열의 첫 번째 객체의 'text' 필드 추출
                responseAPI.setStatusCode(200);
                responseAPI.setBody("\"" + responseText + "\"");  // 응답 텍스트를 바로 Body에 설정합니다.
            } else{
                responseAPI.setStatusCode(200);
                responseAPI.setBody("\"응애 👶\"");
            }
        } catch (Exception e) {
            responseAPI.setStatusCode(500);
            responseAPI.setBody("Error invoking model: " + e.getMessage());
        }
        return responseAPI;
    }

    public static JSONObject invokeModelWithResponseStream(String prompt) {
        BedrockRuntimeAsyncClient client = BedrockRuntimeAsyncClient.builder()
                .region(Region.US_EAST_1)
                .build();

        String modelId = "anthropic.claude-3-haiku-20240307-v1:0";

        var payload = new JSONObject()
                .put("anthropic_version", "bedrock-2023-05-31")
                .put("max_tokens", 1000)
                .append("messages", new JSONObject()
                        .put("role", "user")
                        .append("content", new JSONObject()
                                .put("type", "text")
                                .put("text", prompt)
                        ));

        var request = InvokeModelWithResponseStreamRequest.builder()
                .contentType("application/json")
                .body(SdkBytes.fromUtf8String(payload.toString()))
                .modelId(modelId)
                .build();

        AtomicReference<String> completeMessage = new AtomicReference<>("");

        var handler = InvokeModelWithResponseStreamResponseHandler.builder()
                .onEventStream(stream -> stream.subscribe(event -> event.accept(InvokeModelWithResponseStreamResponseHandler.Visitor.builder()
                        .onChunk(c -> {
                            var chunk = new JSONObject(c.bytes().asUtf8String());
                            var chunkType = chunk.getString("type");
                            if ("content_block_delta".equals(chunkType)) {
                                var text = chunk.optJSONObject("delta").optString("text");
                                System.out.print(text);
                                completeMessage.getAndUpdate(current -> current + text);
                            }
                        })
                        .build())))
                .onComplete(() -> {})  // 완료 이벤트에 대한 처리는 필요 없습니다.
                .build();

        client.invokeModelWithResponseStream(request, handler).join();

        JSONObject structuredResponse = new JSONObject();
        structuredResponse.put("content", new JSONArray().put(new JSONObject().put("text", completeMessage.get())));
        return structuredResponse;
    }

    private static InvokeModelWithResponseStreamResponseHandler createMessagesApiResponseStreamHandler(JSONObject structuredResponse) {
        AtomicReference<String> completeMessage = new AtomicReference<>("");

        Consumer<ResponseStream> responseStreamHandler = event -> event.accept(InvokeModelWithResponseStreamResponseHandler.Visitor.builder()
                .onChunk(c -> {
                    // Decode the chunk
                    var chunk = new JSONObject(c.bytes().asUtf8String());

                    // The Messages API returns different types:
                    var chunkType = chunk.getString("type");
                    if ("message_start".equals(chunkType)) {
                        // The first chunk contains information about the message role
                        String role = chunk.optJSONObject("message").optString("role");
                        structuredResponse.put("role", role);

                    } else if ("content_block_delta".equals(chunkType)) {
                        // These chunks contain the text fragments
                        var text = chunk.optJSONObject("delta").optString("text");
                        // Print the text fragment to the console ...
                        System.out.print(text);
                        // ... and append it to the complete message
                        completeMessage.getAndUpdate(current -> current + text);

                    } else if ("message_delta".equals(chunkType)) {
                        // This chunk contains the stop reason
                        var stopReason = chunk.optJSONObject("delta").optString("stop_reason");
                        structuredResponse.put("stop_reason", stopReason);

                    } else if ("message_stop".equals(chunkType)) {
                        // The last chunk contains the metrics
                        JSONObject metrics = chunk.optJSONObject("amazon-bedrock-invocationMetrics");
                        structuredResponse.put("metrics", new JSONObject()
                                .put("inputTokenCount", metrics.optString("inputTokenCount"))
                                .put("outputTokenCount", metrics.optString("outputTokenCount"))
                                .put("firstByteLatency", metrics.optString("firstByteLatency"))
                                .put("invocationLatency", metrics.optString("invocationLatency")));
                    }
                })
                .build());

        return InvokeModelWithResponseStreamResponseHandler.builder()
                .onEventStream(stream -> stream.subscribe(responseStreamHandler))
                .onComplete(() ->
                        // Add the complete message to the response object
                        structuredResponse.append("content", new JSONObject()
                                .put("type", "text")
                                .put("text", completeMessage.get())))
                .build();
    }
}