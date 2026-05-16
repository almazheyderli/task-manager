package com.taskflow.service;

import com.taskflow.dto.Dto;
import com.taskflow.model.Task;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Dto.TaskResponse> getTasks(String userId, String status, String priority, String search) {
        List<Task> tasks;

        boolean hasStatus   = StringUtils.hasText(status)   && !"all".equalsIgnoreCase(status);
        boolean hasPriority = StringUtils.hasText(priority) && !"all".equalsIgnoreCase(priority);
        boolean hasSearch   = StringUtils.hasText(search);

        Task.TaskStatus  s = hasStatus   ? Task.TaskStatus.valueOf(status.toUpperCase())   : null;
        Task.TaskPriority p = hasPriority ? Task.TaskPriority.valueOf(priority.toUpperCase()) : null;

        if (hasSearch) {
            tasks = taskRepository.findByUserIdAndTitleContainingIgnoreCase(userId, search)
                    .stream()
                    .filter(t -> s == null || t.getStatus() == s)
                    .filter(t -> p == null || t.getPriority() == p)
                    .toList();
        } else if (hasStatus && hasPriority) {
            tasks = taskRepository.findByUserIdAndStatusAndPriorityOrderByCreatedAtDesc(userId, s, p);
        } else if (hasStatus) {
            tasks = taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, s);
        } else if (hasPriority) {
            tasks = taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(userId, p);
        } else {
            tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return tasks.stream().map(Dto.TaskResponse::from).toList();
    }

    public Dto.TaskResponse createTask(String userId, Dto.CreateTaskRequest req) {
        Task task = new Task();
        task.setTitle(req.getTitle().trim());
        task.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);
        task.setPriority(req.getPriority() != null ? req.getPriority() : Task.TaskPriority.MEDIUM);
        task.setDueDate(req.getDueDate());
        task.setUserId(userId);
        task.setStatus(Task.TaskStatus.PENDING);
        return Dto.TaskResponse.from(taskRepository.save(task));
    }

    public Dto.TaskResponse updateTask(String userId, String taskId, Dto.UpdateTaskRequest req) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Task tapılmadı"));

        if (StringUtils.hasText(req.getTitle()))  task.setTitle(req.getTitle().trim());
        if (req.getDescription() != null)          task.setDescription(req.getDescription().trim());
        if (req.getStatus() != null)               task.setStatus(req.getStatus());
        if (req.getPriority() != null)             task.setPriority(req.getPriority());
        if (req.getDueDate() != null)              task.setDueDate(req.getDueDate());

        return Dto.TaskResponse.from(taskRepository.save(task));
    }

    public void deleteTask(String userId, String taskId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Task tapılmadı"));
        taskRepository.delete(task);
    }
}
