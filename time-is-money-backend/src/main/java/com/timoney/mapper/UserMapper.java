package com.timoney.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.timoney.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
