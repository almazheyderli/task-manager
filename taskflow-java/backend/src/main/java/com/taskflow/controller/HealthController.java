package com.taskflow.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${app.version}")
    private String version;

    @Value("${app.name}")
    private String appName;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "app", appName,
                "version", version,
                "timestamp", Instant.now().toString(),
                "java", System.getProperty("java.version"),
                "framework", "Spring Boot 3.2"
        ));
    }
}
