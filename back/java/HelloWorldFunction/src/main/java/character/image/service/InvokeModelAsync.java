package character.image.service;

import common.s3.util.S3Util;
import org.apache.commons.codec.binary.Base64;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;
import software.amazon.awssdk.services.bedrockruntime.model.ValidationException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class InvokeModelAsync {

    public static String invokeTitanImage(String prompt, long seed) throws IOException {

        String titanImageModelId = "amazon.titan-image-generator-v1";

        BedrockRuntimeAsyncClient client = BedrockRuntimeAsyncClient.builder()
            .region(Region.US_EAST_1)
            //                .credentialsProvider(ProfileCredentialsProvider.create("heeyeon"))
            .build();

        String currentDir = System.getProperty("user.dir");
        System.out.println("Current dir using System:" + currentDir);

        //수정할 이미지
        String base64Image = S3Util.imageToBase64("face.png");
        //        String base64Image = imageToBase64("https://gitmagotchi-generated.s3.amazonaws.com/face.png", "");

        //System.out.println("Base64: " + base64Image);
        //        JSONArray imagesArray = new JSONArray();
        //        imagesArray.put(base64Image);

        var inPaintingParams = new JSONObject()
            .put("text", prompt)
            .put("image", base64Image)
            .put("negativeText", "body, bad quality, face in a circle, low res, real picture, person, noise, real, ugly, disgusting, background, square, crack, lacuna")
            .put("maskImage", MaskImageBase64.getImageBase64());

        var imageGenerationConfig = new JSONObject()
            .put("numberOfImages", 1)
            .put("cfgScale", 10.0)
            .put("height", 512)
            .put("width", 512);

        JSONObject payload = new JSONObject()
            .put("taskType", "INPAINTING")
            .put("inPaintingParams", inPaintingParams)
            .put("imageGenerationConfig", imageGenerationConfig);

        InvokeModelRequest request = InvokeModelRequest.builder()
            .body(SdkBytes.fromUtf8String(payload.toString()))
            .modelId(titanImageModelId)
            .contentType("application/json")
            .accept("application/json")
            .build();

        // CompletableFuture<InvokeModelResponse> completableFuture = client.invokeModel(request)
        //     .handle((response, exception) -> {
        //     if (exception != null) {
        //         return createErrorResponse(400, "Content in the generated image(s) has been blocked due to AWS Responsible AI Policy.");
        //     }
        //         return response;
        //     });

        try {
            InvokeModelResponse response = client.invokeModel(request).get();
            JSONObject responseBody = new JSONObject(response.body().asUtf8String());
            String base64ImageData = responseBody.getJSONArray("images").getString(0);
            return base64ImageData;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println(e.getMessage());
            return createErrorResponse(500, "The operation was interrupted.");
        } catch (ExecutionException e) {
            System.err.println(e.getMessage());
            Throwable cause = e.getCause();
            if (cause instanceof ValidationException) {
                return createErrorResponse(400, "Content in the generated image(s) has been blocked due to AWS Responsible AI Policy.");
            }
            return createErrorResponse(500, "Error processing the request: " + e.getMessage());
        }
    }

    private static String createErrorResponse(int statusCode, String message) {
        JSONObject errorResponse = new JSONObject();
        errorResponse.put("statusCode", statusCode);
        errorResponse.put("body", message);
        return errorResponse.toString();
    }

    //Base64로 변환
    public static String imageToBase64(String filePath, String fileName) throws IOException {
        String base64Img = "";

        File f = new File(filePath + fileName);
        if (f.exists() && f.isFile() && f.length() > 0) {
            byte[] bt = new byte[(int) f.length()];
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(f);
                fis.read(bt);
                base64Img = new String(Base64.encodeBase64(bt));
            } catch (Exception e) {
                throw e;
            } finally {
                try {
                    if (fis != null) {
                        fis.close();
                    }
                } catch (IOException e) {
                } catch (Exception e) {
                }
            }
        }

        return base64Img;
    }
}
