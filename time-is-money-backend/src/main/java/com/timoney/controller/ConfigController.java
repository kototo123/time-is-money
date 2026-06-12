package com.timoney.controller;

import com.timoney.dto.ConfigDTO;
import com.timoney.entity.UserConfig;
import com.timoney.service.UserService;
import com.timoney.util.ResponseResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final UserService userService;

    public ConfigController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseResult<Map<String, Object>> getConfig(@RequestParam Long userId) {
        UserConfig config = userService.getConfig(userId);
        Map<String, Object> map = new HashMap<>();
        if (config != null) {
            map.put("id", config.getId());
            map.put("userId", config.getUserId());
            map.put("salaryType", config.getSalaryType());
            map.put("monthlySalary", config.getMonthlySalary());
            map.put("hourlyRate", config.getHourlyRate());
            map.put("dailyWorkHours", config.getDailyWorkHours());
            map.put("workStartTime", config.getWorkStartTime() != null ? config.getWorkStartTime().toString() : null);
            map.put("workEndTime", config.getWorkEndTime() != null ? config.getWorkEndTime().toString() : null);
            map.put("lunchStart", config.getLunchStart() != null ? config.getLunchStart().toString() : null);
            map.put("lunchEnd", config.getLunchEnd() != null ? config.getLunchEnd().toString() : null);
            map.put("workDaysPerWeek", config.getWorkDaysPerWeek());
            map.put("workDays", config.getWorkDays());
            map.put("workDateOverrides", config.getWorkDateOverrides());
        }
        return ResponseResult.success(map);
    }

    @PostMapping
    public ResponseResult<Void> saveConfig(@RequestParam Long userId,
                                           @Valid @RequestBody ConfigDTO dto) {
        userService.saveConfig(userId, dto);
        return ResponseResult.success(null);
    }
}
