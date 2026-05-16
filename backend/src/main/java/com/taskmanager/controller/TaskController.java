package com.taskmanager.controller;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getDashboard(getCurrentUser(userDetails)));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskDto> createTask(@PathVariable Long projectId,
                                               @Valid @RequestBody CreateTaskRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.createTask(projectId, request, getCurrentUser(userDetails)));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDto>> getProjectTasks(@PathVariable Long projectId,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, getCurrentUser(userDetails)));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long taskId,
                                               @RequestBody UpdateTaskRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request, getCurrentUser(userDetails)));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(taskId, getCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}
