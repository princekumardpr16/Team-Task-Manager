package com.taskmanager.controller;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.createProject(request, getCurrentUser(userDetails)));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getMyProjects(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getMyProjects(getCurrentUser(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getProject(id, getCurrentUser(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id,
                                                     @Valid @RequestBody CreateProjectRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.updateProject(id, request, getCurrentUser(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        projectService.deleteProject(id, getCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberDto>> getMembers(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getMembers(id, getCurrentUser(userDetails)));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<MemberDto> addMember(@PathVariable Long id,
                                                @Valid @RequestBody AddMemberRequest request,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.addMember(id, request, getCurrentUser(userDetails)));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id,
                                              @PathVariable Long userId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        projectService.removeMember(id, userId, getCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}
