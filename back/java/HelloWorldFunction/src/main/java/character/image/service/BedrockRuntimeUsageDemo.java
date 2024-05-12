package character.image.service;


import common.s3.upload.S3ImageUploader;
import software.amazon.awssdk.services.bedrockruntime.model.BedrockRuntimeException;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Random;

public class BedrockRuntimeUsageDemo {

    private static final Random random = new Random();

    private static final String TITAN_IMAGE = "amazon.titan-image-generator-v1";

    //    public static void main(String[] args) throws IOException {
    //        BedrockRuntimeUsageDemo.textToImage();
    //    }

    private static void invoke(String modelId, String prompt) throws IOException {
        invoke(modelId, prompt, null);
    }

    private static void invoke(String modelId, String prompt, String stylePreset) throws IOException {
        System.out.println("\n" + new String(new char[88]).replace("\0", "-"));
        System.out.println("Invoking: " + modelId);
        System.out.println("Prompt: " + prompt);

        try {
            switch (modelId) {
                case TITAN_IMAGE:
                    createImage(TITAN_IMAGE, prompt, random.nextLong() & 0xFFFFFFFL);
                    break;
                default:
                    throw new IllegalStateException("Unexpected value: " + modelId);
            }
        } catch (BedrockRuntimeException | IOException e) {
            System.out.println("Couldn't invoke model " + modelId + ": " + e.getMessage());
            throw e;
        }
    }

    private static void createImage(String modelId, String prompt, long seed) throws IOException {
        createImage(modelId, prompt, seed, null);
    }

    private static void createImage(String modelId, String prompt, long seed, String stylePreset) throws IOException {
        String base64ImageData = InvokeModelAsync.invokeTitanImage(prompt, seed);
        String imagePath = saveImage(modelId, base64ImageData);
        System.out.printf("Success: The generated image has been saved to %s%n", imagePath);
    }

    public static void textToImage() throws IOException {
        String imagePrompt = "Think of the border circle as a face and draw only the eyes, nose, and mouth of the cat character image. "
        + "Remember, you are not drawing a face in a circle, the circle is a face.";

        BedrockRuntimeUsageDemo.invoke(TITAN_IMAGE, imagePrompt);
    }

    private static String saveImage(String modelId, String base64ImageData) {
        S3ImageUploader uploader = new S3ImageUploader();

        uploader.uploadImageToS3("gitmagotchi-character-image", base64ImageData);

        try {
            String directory = "output";
            URI uri = InvokeModelAsync.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            Path outputPath = Paths.get(uri).getParent().getParent().resolve(directory);

            if (!Files.exists(outputPath)) {
                Files.createDirectories(outputPath);
            }

            int i = 1;
            String fileName;
            do {
                fileName = String.format("%s_%d.png", modelId, i);
                i++;
            } while (Files.exists(outputPath.resolve(fileName)));

            byte[] imageBytes = Base64.getDecoder().decode(base64ImageData);

            Path filePath = outputPath.resolve(fileName);
            try (FileOutputStream fileOutputStream = new FileOutputStream(filePath.toFile())) {
                fileOutputStream.write(imageBytes);
            }

            return filePath.toString();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            System.exit(1);
        }
        return null;
    }
}
