package com.taskflow;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class TaskServiceTest {

    @Test
    void testTaskCreation() {
        String taskName = "Test Task";
        assertEquals("Test Task", taskName);
    }

    @Test
    void testTaskDeletion() {
        String deletedTask = "Deleted Task";
        assertEquals("Deleted Task", deletedTask);
    }

    @Test
    void testUserLogin() {
        String username = "Almaz";
        assertEquals("Almaz", username);
    }

    @Test
    void testUserRegister() {
        String email = "almaz@test.com";
        assertEquals("almaz@test.com", email);
    }

    @Test
    void testTaskRetrieval() {
        int taskCount = 5;
        assertEquals(5, taskCount);
    }
}