package com.timoney.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@TableName("user_config")
public class UserConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String salaryType;
    private BigDecimal monthlySalary;
    private BigDecimal hourlyRate;
    private BigDecimal dailyWorkHours;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private LocalTime lunchStart;
    private LocalTime lunchEnd;
    private Integer workDaysPerWeek;
    private String workDays;
    private String workDateOverrides;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getSalaryType() { return salaryType; }
    public void setSalaryType(String salaryType) { this.salaryType = salaryType; }
    public BigDecimal getMonthlySalary() { return monthlySalary; }
    public void setMonthlySalary(BigDecimal monthlySalary) { this.monthlySalary = monthlySalary; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public BigDecimal getDailyWorkHours() { return dailyWorkHours; }
    public void setDailyWorkHours(BigDecimal dailyWorkHours) { this.dailyWorkHours = dailyWorkHours; }
    public LocalTime getWorkStartTime() { return workStartTime; }
    public void setWorkStartTime(LocalTime workStartTime) { this.workStartTime = workStartTime; }
    public LocalTime getWorkEndTime() { return workEndTime; }
    public void setWorkEndTime(LocalTime workEndTime) { this.workEndTime = workEndTime; }
    public LocalTime getLunchStart() { return lunchStart; }
    public void setLunchStart(LocalTime lunchStart) { this.lunchStart = lunchStart; }
    public LocalTime getLunchEnd() { return lunchEnd; }
    public void setLunchEnd(LocalTime lunchEnd) { this.lunchEnd = lunchEnd; }
    public Integer getWorkDaysPerWeek() { return workDaysPerWeek; }
    public void setWorkDaysPerWeek(Integer workDaysPerWeek) { this.workDaysPerWeek = workDaysPerWeek; }
    public String getWorkDays() { return workDays; }
    public void setWorkDays(String workDays) { this.workDays = workDays; }
    public String getWorkDateOverrides() { return workDateOverrides; }
    public void setWorkDateOverrides(String workDateOverrides) { this.workDateOverrides = workDateOverrides; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
