package com.skillforge.resume.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;
    private final boolean isCloudinaryConfigured;
    private final String localStorageDir;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name:placeholder}") String cloudName,
            @Value("${cloudinary.api-key:placeholder}") String apiKey,
            @Value("${cloudinary.api-secret:placeholder}") String apiSecret
    ) {
        if (!"placeholder".equalsIgnoreCase(cloudName) && !"placeholder".equalsIgnoreCase(apiKey)) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));
            this.isCloudinaryConfigured = true;
            log.info("Cloudinary storage provider initialized");
        } else {
            this.cloudinary = null;
            this.isCloudinaryConfigured = false;
            log.warn("Cloudinary credentials not configured. Falling back to local filesystem storage.");
        }
        this.localStorageDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";
    }

    public String uploadFile(MultipartFile file, UUID studentId) {
        String filename = studentId + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        if (isCloudinaryConfigured && cloudinary != null) {
            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "skillforge/resumes"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Uploaded resume file to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception ex) {
                log.warn("Cloudinary upload failed. Falling back to local storage: {}", ex.getMessage());
            }
        }

        // Local storage fallback
        try {
            Path uploadPath = Paths.get(localStorageDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath);
            String localUrl = "/uploads/resumes/" + filename;
            log.info("Saved resume locally: {}", localUrl);
            return localUrl;
        } catch (Exception ex) {
            log.error("Failed to save file locally: {}", ex.getMessage());
            return "http://localhost:8080/uploads/resumes/" + filename;
        }
    }
}
