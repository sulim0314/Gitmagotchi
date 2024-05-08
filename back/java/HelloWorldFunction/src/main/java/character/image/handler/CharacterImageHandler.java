package character.image.handler;

import character.image.service.BedrockRuntimeUsageDemo;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import java.io.IOException;

public class CharacterImageHandler implements RequestHandler<Object, String> {

    @Override
    public String handleRequest(Object input, Context context) {
        try {
            BedrockRuntimeUsageDemo.textToImage();
            return "Image generation successful";
        } catch (IOException e) {
            context.getLogger().log("Error generating image: " + e.getMessage());
            return "Image generation failed";
        }
    }
}