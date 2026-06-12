package com.timoney.controller;

import com.timoney.dto.ConfigDTO;
import com.timoney.entity.UserConfig;
import com.timoney.service.UserService;
import com.timoney.util.ResponseResult;
import jakarta.validation.Valid;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final UserService userService;
    private final JdbcTemplate jdbcTemplate;

    public ConfigController(UserService userService, JdbcTemplate jdbcTemplate) {
        this.userService = userService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseResult<?> getConfig(@RequestParam Long userId) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT * FROM user_config WHERE user_id = ?", userId);
            if (rows.isEmpty()) return ResponseResult.success(null);
            return ResponseResult.success("rows=" + rows.size() + " cols=" + rows.get(0).keySet());
        } catch (Exception e) {
            return ResponseResult.error(500, e.getClass().getName() + ": " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseResult<Void> saveConfig(@RequestParam Long userId,
                                           @Valid @RequestBody ConfigDTO dto) {
        userService.saveConfig(userId, dto);
        return ResponseResult.success(null);
    }
}
