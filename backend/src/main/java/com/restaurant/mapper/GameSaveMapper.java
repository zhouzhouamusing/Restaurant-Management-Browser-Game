package com.restaurant.mapper;

import com.restaurant.entity.GameSave;
import org.apache.ibatis.annotations.*;

@Mapper
public interface GameSaveMapper {

    @Select("SELECT * FROM game_save WHERE user_id = #{userId} ORDER BY save_time DESC LIMIT 1")
    GameSave findLatestByUserId(@Param("userId") Long userId);

    @Insert("INSERT INTO game_save(user_id, coins, level, dishes, customers_served, seat_count, staff_data, bill_history) VALUES(#{userId}, #{coins}, #{level}, #{dishes}, #{customersServed}, #{seatCount}, #{staffData}, #{billHistory})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(GameSave gameSave);

    @Update("UPDATE game_save SET coins=#{coins}, level=#{level}, dishes=#{dishes}, customers_served=#{customersServed}, seat_count=#{seatCount}, staff_data=#{staffData}, bill_history=#{billHistory}, update_time=NOW() WHERE id=#{id}")
    int update(GameSave gameSave);
}
