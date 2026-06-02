package com.restaurant.service;

import cn.hutool.crypto.SecureUtil;
import com.restaurant.entity.User;
import com.restaurant.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public User register(String username, String password, String nickname) {
        if (userMapper.findByUsername(username) != null) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(SecureUtil.md5(password));
        user.setNickname(nickname != null ? nickname : username);
        userMapper.insert(user);
        return user;
    }

    public User login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!user.getPassword().equals(SecureUtil.md5(password))) {
            throw new RuntimeException("密码错误");
        }
        return user;
    }
}
