package com.taskmanager.service;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final MapperService mapper;

    public ProjectDto createProject(CreateProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        project = projectRepository.save(project);

        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role(ProjectMember.ProjectRole.ADMIN)
                .build();
        memberRepository.save(ownerMember);

        return mapper.toProjectDto(projectRepository.findById(project.getId()).orElseThrow(), currentUser);
    }

    public List<ProjectDto> getMyProjects(User currentUser) {
        return projectRepository.findAllProjectsForUser(currentUser).stream()
                .map(p -> mapper.toProjectDto(p, currentUser))
                .collect(Collectors.toList());
    }

    public ProjectDto getProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertMember(project, currentUser);
        return mapper.toProjectDto(project, currentUser);
    }

    public ProjectDto updateProject(Long id, CreateProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertAdmin(project, currentUser);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return mapper.toProjectDto(projectRepository.save(project), currentUser);
    }

    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only owner can delete project");
        }
        projectRepository.delete(project);
    }

    public List<MemberDto> getMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertMember(project, currentUser);
        return memberRepository.findByProject(project).stream()
                .map(mapper::toMemberDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberDto addMember(Long projectId, AddMemberRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertAdmin(project, currentUser);

        User userToAdd = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        if (memberRepository.existsByProjectAndUser(project, userToAdd)) {
            throw new RuntimeException("User is already a member");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .role(ProjectMember.ProjectRole.valueOf(request.getRole().toUpperCase()))
                .build();

        return mapper.toMemberDto(memberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertAdmin(project, currentUser);

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove project owner");
        }

        memberRepository.deleteByProjectAndUser(project, userToRemove);
    }

    public void assertMember(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = memberRepository.existsByProjectAndUser(project, user);
        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }
    }

    public void assertAdmin(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        if (isOwner) return;
        ProjectMember member = memberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getRole() != ProjectMember.ProjectRole.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
    }
}
