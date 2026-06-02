-- 餐厅经营小游戏数据库建表脚本
CREATE DATABASE IF NOT EXISTS restaurant_game DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE restaurant_game;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(32) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(128) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(64) DEFAULT '' COMMENT '昵称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 游戏存档表
CREATE TABLE IF NOT EXISTS `game_save` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '存档ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `coins` INT DEFAULT 100 COMMENT '金币数量',
    `level` INT DEFAULT 1 COMMENT '餐厅等级',
    `dishes` TEXT COMMENT '已解锁菜品JSON',
    `customers_served` INT DEFAULT 0 COMMENT '已服务顾客数',
    `seat_count` INT DEFAULT 4 COMMENT '座位数量',
    `staff_data` TEXT COMMENT '员工数据JSON',
    `bill_history` TEXT COMMENT '账单历史JSON',
    `decoration_data` TEXT COMMENT '装饰数据JSON(墙纸/地板/摆件/桌位)',
    `save_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '存档时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏存档表';
