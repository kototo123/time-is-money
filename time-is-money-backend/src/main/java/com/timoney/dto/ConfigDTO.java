package com.timoney.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalTime;

public class ConfigDTO {
    @NotBlank(message = "薪资类型不能为空")
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
}
