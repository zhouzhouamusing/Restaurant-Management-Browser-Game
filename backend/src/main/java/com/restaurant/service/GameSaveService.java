package com.restaurant.service;

import com.restaurant.entity.GameSave;
import com.restaurant.mapper.GameSaveMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameSaveService {

    @Autowired
    private GameSaveMapper gameSaveMapper;

    public GameSave load(Long userId) {
        GameSave save = gameSaveMapper.findLatestByUserId(userId);
        if (save == null) {
            save = new GameSave();
            save.setUserId(userId);
            save.setCoins(100);
            save.setLevel(1);
            save.setDishes("[{\"id\":1,\"name\":\"蛋炒饭\",\"price\":10,\"cookTime\":3,\"emoji\":\"🍚\"},{\"id\":2,\"name\":\"番茄汤\",\"price\":8,\"cookTime\":2,\"emoji\":\"🍅\"},{\"id\":3,\"name\":\"红烧肉\",\"price\":20,\"cookTime\":5,\"emoji\":\"🥩\"}]");
            save.setCustomersServed(0);
            save.setSeatCount(4);
            save.setStaffData("[]");
            save.setBillHistory("[]");
            gameSaveMapper.insert(save);
        }
        return save;
    }

    public GameSave save(GameSave gameSave) {
        GameSave existing = gameSaveMapper.findLatestByUserId(gameSave.getUserId());
        if (existing != null) {
            gameSave.setId(existing.getId());
            gameSaveMapper.update(gameSave);
        } else {
            gameSaveMapper.insert(gameSave);
        }
        return gameSave;
    }
}
