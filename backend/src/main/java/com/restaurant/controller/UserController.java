package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.User;
import com.restaurant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result<User> register(@RequestBody Map<String, String> params) {
        try {
            User user = userService.register(
                params.get("username"),
                params.get("password"),
                params.get("nickname")
            );
            user.setPassword(null);
            return Result.ok(user);
        } catch (RuntimeException e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Result<User> login(@RequestBody Map<String, String> params) {
        try {
            User user = userService.login(
                params.get("username"),
                params.get("password")
            );
            user.setPassword(null);
            return Result.ok(user);
        } catch (RuntimeException e) {
            return Result.fail(e.getMessage());
        }
    }
}
