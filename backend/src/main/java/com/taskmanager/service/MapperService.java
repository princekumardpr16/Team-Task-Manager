package com.taskmanager.service;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class MapperService {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public ProjectDto toProjectDto(Project project, User currentUser) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setOwner(toUserDto(project.getOwner()));
        dto.setCreatedAt(project.getCreatedAt());
        dto.setMemberCount(project.getMembers() != null ? project.getMembers().size() : 0);
        dto.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);

        if (project.getOwner().getId().equals(currentUser.getId())) {
            dto.setMyRole("ADMIN");
        } else if (project.getMembers() != null) {
            project.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .ifPresent(m -> dto.setMyRole(m.getRole().name()));
        }
        return dto;
    }

    public MemberDto toMemberDto(ProjectMember member) {
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setUser(toUserDto(member.getUser()));
        dto.setRole(member.getRole().name());
        return dto;
    }

    public TaskDto toTaskDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus().name());
        dto.setPriority(task.getPriority().name());
        dto.setDueDate(task.getDueDate());
        dto.setOverdue(task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Task.TaskStatus.DONE);
        dto.setAssignee(toUserDto(task.getAssignee()));
        dto.setCreatedBy(toUserDto(task.getCreatedBy()));
        dto.setProjectId(task.getProject().getId());
        dto.setProjectName(task.getProject().getName());
        dto.setCreatedAt(task.getCreatedAt());
        return dto;
    }
}
