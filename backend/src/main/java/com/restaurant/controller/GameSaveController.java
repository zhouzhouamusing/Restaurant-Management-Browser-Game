package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.GameSave;
import com.restaurant.service.GameSaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameSaveController {

    @Autowired
    private GameSaveService gameSaveService;

    @GetMapping("/load/{userId}")
    public Result<GameSave> load(@PathVariable Long userId) {
        return Result.ok(gameSaveService.load(userId));
    }

    @PostMapping("/save")
    public Result<GameSave> save(@RequestBody GameSave gameSave) {
        return Result.ok(gameSaveService.save(gameSave));
    }
}
