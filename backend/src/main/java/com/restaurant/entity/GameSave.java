package com.restaurant.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GameSave {
    private Long id;
    private Long userId;
    private Integer coins;
    private Integer level;
    private String dishes;
    private Integer customersServed;
    private LocalDateTime saveTime;
    private LocalDateTime updateTime;
}
