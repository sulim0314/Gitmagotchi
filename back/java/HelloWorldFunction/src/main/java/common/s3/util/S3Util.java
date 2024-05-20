package common.s3.util;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

public class S3Util {
    private static final String BUCKET_NAME = "gitmagotchi-generated";

    public static String imageToBase64(String key) {
        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion("us-east-1")
                .build();
        try {
            S3Object s3Object = s3Client.getObject(new GetObjectRequest(BUCKET_NAME, key));
            InputStream objectData = s3Object.getObjectContent();
            byte[] bytes = objectData.readAllBytes();
            return Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}