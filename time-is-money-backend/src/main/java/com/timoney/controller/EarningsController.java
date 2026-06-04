package com.timoney.controller;

import com.timoney.dto.EarningsDTO;
import com.timoney.service.UserService;
import com.timoney.util.ResponseResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/earnings")
public class EarningsController {

    private final UserService userService;

    public EarningsController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/today")
    public ResponseResult<EarningsDTO> getTodayEarnings(@RequestParam Long userId) {
        return ResponseResult.success(userService.getTodayEarnings(userId));
    }
}
