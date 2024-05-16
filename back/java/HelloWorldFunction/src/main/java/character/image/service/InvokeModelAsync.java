package character.image.service;

import common.s3.util.S3Util;
import org.apache.commons.codec.binary.Base64;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

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
            .put("negativeText", "body")
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

        CompletableFuture<InvokeModelResponse> completableFuture = client.invokeModel(request)
            .whenComplete((response, exception) -> {
                if (exception != null) {
                    System.out.println("Model invocation failed: " + exception);
                }
            });

        String base64ImageData = "";
        try {
            InvokeModelResponse response = completableFuture.get();
            JSONObject responseBody = new JSONObject(response.body().asUtf8String());
            base64ImageData = responseBody
                .getJSONArray("images")
                .getString(0);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println(e.getMessage());
        } catch (ExecutionException e) {
            System.err.println(e.getMessage());
        }

        return base64ImageData;
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
