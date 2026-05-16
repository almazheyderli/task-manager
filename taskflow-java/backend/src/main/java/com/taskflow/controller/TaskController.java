package com.taskflow.controller;

import com.taskflow.dto.Dto;
import com.taskflow.model.User;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<Map<String, List<Dto.TaskResponse>>> getTasks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {

        List<Dto.TaskResponse> tasks = taskService.getTasks(user.getId(), status, priority, search);
        return ResponseEntity.ok(Map.of("tasks", tasks));
    }

    @PostMapping
    public ResponseEntity<Map<String, Dto.TaskResponse>> createTask(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody Dto.CreateTaskRequest req) {

        Dto.TaskResponse task = taskService.createTask(user.getId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("task", task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Dto.TaskResponse>> updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody Dto.UpdateTaskRequest req) {

        Dto.TaskResponse task = taskService.updateTask(user.getId(), id, req);
        return ResponseEntity.ok(Map.of("task", task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {

        taskService.deleteTask(user.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Task silindi"));
    }
}
