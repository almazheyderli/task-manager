package com.taskflow.repository;

import com.taskflow.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, Task.TaskStatus status);

    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(String userId, Task.TaskPriority priority);

    List<Task> findByUserIdAndStatusAndPriorityOrderByCreatedAtDesc(
            String userId, Task.TaskStatus status, Task.TaskPriority priority);

    @Query("{ 'userId': ?0, 'title': { $regex: ?1, $options: 'i' } }")
    List<Task> findByUserIdAndTitleContainingIgnoreCase(String userId, String search);

    @Query("{ 'userId': ?0, 'title': { $regex: ?3, $options: 'i' }, $and: [ { 'status': ?1 }, { 'priority': ?2 } ] }")
    List<Task> findByUserIdAndStatusAndPriorityAndTitleRegex(
            String userId, Task.TaskStatus status, Task.TaskPriority priority, String search);
}
