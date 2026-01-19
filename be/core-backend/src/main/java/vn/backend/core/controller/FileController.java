package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.FileStorageService;
import vn.backend.core.util.Mapper;

@RestController
public class FileController {
    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/file/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        var result = fileStorageService.upload(file);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}