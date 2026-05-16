package com.taskflow.dto;

import com.taskflow.model.Task;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

public class Dto {

    // ── Auth ──────────────────────────────────────────────────────────────────

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Ad tələb olunur")
        @Size(min = 2, max = 50, message = "Ad 2-50 simvol arasında olmalıdır")
        private String name;

        @NotBlank(message = "Email tələb olunur")
        @Email(message = "Email formatı düzgün deyil")
        private String email;

        @NotBlank(message = "Şifrə tələb olunur")
        @Size(min = 6, message = "Şifrə ən az 6 simvol olmalıdır")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email tələb olunur")
        @Email(message = "Email formatı düzgün deyil")
        private String email;

        @NotBlank(message = "Şifrə tələb olunur")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserDto user;

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }
    }

    @Data
    public static class UserDto {
        private String id;
        private String name;
        private String email;

        public UserDto(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
    }

    // ── Task ──────────────────────────────────────────────────────────────────

    @Data
    public static class CreateTaskRequest {
        @NotBlank(message = "Başlıq tələb olunur")
        @Size(max = 200, message = "Başlıq 200 simvoldan çox ola bilməz")
        private String title;

        @Size(max = 1000, message = "Açıqlama 1000 simvoldan çox ola bilməz")
        private String description;

        private Task.TaskPriority priority = Task.TaskPriority.MEDIUM;
        private LocalDate dueDate;
    }

    @Data
    public static class UpdateTaskRequest {
        @Size(max = 200)
        private String title;

        @Size(max = 1000)
        private String description;

        private Task.TaskStatus status;
        private Task.TaskPriority priority;
        private LocalDate dueDate;
    }

    @Data
    public static class TaskResponse {
        private String id;
        private String title;
        private String description;
        private Task.TaskStatus status;
        private Task.TaskPriority priority;
        private String userId;
        private LocalDate dueDate;
        private Instant createdAt;
        private Instant updatedAt;

        public static TaskResponse from(Task t) {
            TaskResponse r = new TaskResponse();
            r.id = t.getId();
            r.title = t.getTitle();
            r.description = t.getDescription();
            r.status = t.getStatus();
            r.priority = t.getPriority();
            r.userId = t.getUserId();
            r.dueDate = t.getDueDate();
            r.createdAt = t.getCreatedAt();
            r.updatedAt = t.getUpdatedAt();
            return r;
        }
    }

    // ── Error ─────────────────────────────────────────────────────────────────

    @Data
    public static class ErrorResponse {
        private String error;
        private int status;

        public ErrorResponse(String error, int status) {
            this.error = error;
            this.status = status;
        }
    }
}
