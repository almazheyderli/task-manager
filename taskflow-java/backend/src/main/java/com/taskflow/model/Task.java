package com.taskflow.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
@CompoundIndex(def = "{'userId': 1, 'status': 1, 'priority': 1}")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    private TaskStatus status = TaskStatus.PENDING;
    private TaskPriority priority = TaskPriority.MEDIUM;

    private String userId;
    private LocalDate dueDate;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum TaskStatus {
        PENDING, COMPLETED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH
    }
}
