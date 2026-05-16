package com.taskmanager.service;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final MapperService mapper;

    public TaskDto createTask(Long projectId, CreateTaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectService.assertMember(project, currentUser);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(Task.Priority.valueOf(request.getPriority().toUpperCase()))
                .dueDate(request.getDueDate())
                .project(project)
                .assignee(assignee)
                .createdBy(currentUser)
                .status(Task.TaskStatus.TODO)
                .build();

        return mapper.toTaskDto(taskRepository.save(task));
    }

    public List<TaskDto> getProjectTasks(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectService.assertMember(project, currentUser);
        return taskRepository.findByProject(project).stream()
                .map(mapper::toTaskDto)
                .collect(Collectors.toList());
    }

    public TaskDto updateTask(Long taskId, UpdateTaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectService.assertMember(task.getProject(), currentUser);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(Task.TaskStatus.valueOf(request.getStatus()));
        if (request.getPriority() != null) task.setPriority(Task.Priority.valueOf(request.getPriority()));
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return mapper.toTaskDto(taskRepository.save(task));
    }

    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectService.assertAdmin(task.getProject(), currentUser);
        taskRepository.delete(task);
    }

    public DashboardDto getDashboard(User currentUser) {
        List<Project> projects = projectRepository.findAllProjectsForUser(currentUser);
        List<Task> allTasks = taskRepository.findAllByProjects(projects);
        List<Task> myTasks = taskRepository.findPendingTasksForUser(currentUser);
        List<Task> overdue = taskRepository.findOverdueTasks(projects, LocalDate.now());

        DashboardDto dto = new DashboardDto();
        dto.setTotalProjects(projects.size());
        dto.setTotalTasks(allTasks.size());
        dto.setTodoTasks((int) allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.TODO).count());
        dto.setInProgressTasks((int) allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.IN_PROGRESS).count());
        dto.setDoneTasks((int) allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.DONE).count());
        dto.setOverdueTasks(overdue.size());
        dto.setMyTasks(myTasks.stream().map(mapper::toTaskDto).collect(Collectors.toList()));
        dto.setRecentTasks(allTasks.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(mapper::toTaskDto)
                .collect(Collectors.toList()));
        return dto;
    }
}
