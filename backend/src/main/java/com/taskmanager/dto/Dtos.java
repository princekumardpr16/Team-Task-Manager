package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Dtos {

    // ---- AUTH ----
    @Data
    public static class SignupRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
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

    // ---- USER ----
    @Data
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private LocalDateTime createdAt;
    }

    // ---- PROJECT ----
    @Data
    public static class CreateProjectRequest {
        @NotBlank private String name;
        private String description;
    }

    @Data
    public static class ProjectDto {
        private Long id;
        private String name;
        private String description;
        private UserDto owner;
        private LocalDateTime createdAt;
        private int memberCount;
        private int taskCount;
        private String myRole;
    }

    @Data
    public static class AddMemberRequest {
        @NotBlank @Email private String email;
        private String role = "MEMBER";
    }

    @Data
    public static class MemberDto {
        private Long id;
        private UserDto user;
        private String role;
    }

    // ---- TASK ----
    @Data
    public static class CreateTaskRequest {
        @NotBlank private String title;
        private String description;
        private String priority = "MEDIUM";
        private LocalDate dueDate;
        private Long assigneeId;
    }

    @Data
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private String status;
        private String priority;
        private LocalDate dueDate;
        private Long assigneeId;
    }

    @Data
    public static class TaskDto {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String priority;
        private LocalDate dueDate;
        private boolean overdue;
        private UserDto assignee;
        private UserDto createdBy;
        private Long projectId;
        private String projectName;
        private LocalDateTime createdAt;
    }

    // ---- DASHBOARD ----
    @Data
    public static class DashboardDto {
        private int totalProjects;
        private int totalTasks;
        private int todoTasks;
        private int inProgressTasks;
        private int doneTasks;
        private int overdueTasks;
        private java.util.List<TaskDto> myTasks;
        private java.util.List<TaskDto> recentTasks;
    }
}
