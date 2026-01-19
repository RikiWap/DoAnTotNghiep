package vn.backend.core.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.exception.AppException;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${system.domain}")
    private String domain;

    public String upload(MultipartFile file) {
        try (InputStream stream = file.getInputStream()) {
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();

            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(filename)
                            .stream(stream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // Trả URL công khai (qua Nginx proxy)
            return domain + "/" + bucket + "/" + filename;
        } catch (Exception e) {
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
        }
    }
}
