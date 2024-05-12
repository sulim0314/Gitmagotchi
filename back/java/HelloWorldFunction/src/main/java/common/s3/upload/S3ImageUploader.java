package common.s3.upload;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.UUID;

public class S3ImageUploader {
    private AmazonS3 s3client;

    public S3ImageUploader() {
        // S3 클라이언트 초기화
        this.s3client = AmazonS3ClientBuilder.standard().build();
    }

    public void uploadImageToS3(String bucketName, String base64Image) {
        try {
            // Base64 문자열을 바이트 배열로 디코딩
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            // 메타데이터 설정 (옵션)
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(imageBytes.length);
            metadata.setContentType("image/png"); // 적절한 MIME 타입 설정

            // 고유한 파일 이름 생성
            String fileName = "image_" + UUID.randomUUID().toString() + ".png";

            // S3에 업로드
            PutObjectRequest putRequest = new PutObjectRequest(bucketName, fileName,
                    new ByteArrayInputStream(imageBytes), metadata);
            s3client.putObject(putRequest);

            // S3 객체 URL 생성
            String s3ObjectUrl = String.format("https://%s.s3.amazonaws.com/%s", bucketName, fileName);

            System.out.println("Image uploaded successfully to bucket " + bucketName + " with name " + fileName);
            System.out.println(s3ObjectUrl.toString());
        } catch (Exception e) {
            System.err.println("Error uploading image to S3: " + e.getMessage());
        }
    }
}
