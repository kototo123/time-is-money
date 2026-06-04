package com.timoney.controller;

import com.timoney.dto.LoginDTO;
import com.timoney.entity.User;
import com.timoney.service.UserService;
import com.timoney.util.ResponseResult;
import com.timoney.util.WxUtils;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final WxUtils wxUtils;

    public UserController(UserService userService, WxUtils wxUtils) {
        this.userService = userService;
        this.wxUtils = wxUtils;
    }

    @PostMapping("/login")
    public ResponseResult<User> login(@Valid @RequestBody LoginDTO dto) {
        String openid = wxUtils.getOpenid(dto.getCode());
        User user = userService.login(openid, dto.getNickname(), dto.getAvatarUrl());
        return ResponseResult.success(user);
    }
}
