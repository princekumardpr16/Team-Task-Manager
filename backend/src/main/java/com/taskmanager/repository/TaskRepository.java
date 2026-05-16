package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.status != 'DONE'")
    List<Task> findPendingTasksForUser(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("projects") List<Project> projects, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects")
    List<Task> findAllByProjects(@Param("projects") List<Project> projects);
}
