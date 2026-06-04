package com.timoney.controller;

import com.timoney.dto.ConfigDTO;
import com.timoney.entity.UserConfig;
import com.timoney.service.UserService;
import com.timoney.util.ResponseResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final UserService userService;

    public ConfigController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseResult<UserConfig> getConfig(@RequestParam Long userId) {
        return ResponseResult.success(userService.getConfig(userId));
    }

    @PostMapping
    public ResponseResult<Void> saveConfig(@RequestParam Long userId,
                                           @Valid @RequestBody ConfigDTO dto) {
        userService.saveConfig(userId, dto);
        return ResponseResult.success(null);
    }
}
