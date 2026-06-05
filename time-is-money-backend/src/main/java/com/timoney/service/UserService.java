package com.timoney.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.timoney.dto.ConfigDTO;
import com.timoney.dto.EarningsDTO;
import com.timoney.entity.DailyRecord;
import com.timoney.entity.User;
import com.timoney.entity.UserConfig;
import com.timoney.mapper.DailyRecordMapper;
import com.timoney.mapper.UserConfigMapper;
import com.timoney.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final UserConfigMapper configMapper;
    private final DailyRecordMapper dailyRecordMapper;

    public UserService(UserMapper userMapper, UserConfigMapper configMapper, DailyRecordMapper dailyRecordMapper) {
        this.userMapper = userMapper;
        this.configMapper = configMapper;
        this.dailyRecordMapper = dailyRecordMapper;
    }

    @Transactional
    public User login(String openid, String nickname, String avatarUrl) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>().eq(User::getOpenid, openid);
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname(nickname != null ? nickname : "");
            user.setAvatarUrl(avatarUrl != null ? avatarUrl : "");
            userMapper.insert(user);

            UserConfig config = new UserConfig();
            config.setUserId(user.getId());
            config.setSalaryType("MONTHLY");
            config.setMonthlySalary(new BigDecimal("5000"));
            config.setDailyWorkHours(new BigDecimal("8"));
            config.setWorkStartTime(LocalTime.of(9, 0));
            config.setWorkEndTime(LocalTime.of(18, 0));
            configMapper.insert(config);
        }
        return user;
    }

    public UserConfig getConfig(Long userId) {
        LambdaQueryWrapper<UserConfig> wrapper = new LambdaQueryWrapper<UserConfig>()
                .eq(UserConfig::getUserId, userId);
        return configMapper.selectOne(wrapper);
    }

    @Transactional
    public void saveConfig(Long userId, ConfigDTO dto) {
        LambdaQueryWrapper<UserConfig> wrapper = new LambdaQueryWrapper<UserConfig>()
                .eq(UserConfig::getUserId, userId);
        UserConfig config = configMapper.selectOne(wrapper);
        if (config == null) {
            config = new UserConfig();
            config.setUserId(userId);
        }
        config.setSalaryType(dto.getSalaryType());
        config.setMonthlySalary(dto.getMonthlySalary());
        config.setHourlyRate(dto.getHourlyRate());
        config.setDailyWorkHours(dto.getDailyWorkHours());
        config.setWorkStartTime(dto.getWorkStartTime());
        config.setWorkEndTime(dto.getWorkEndTime());

        if (config.getId() == null) {
            configMapper.insert(config);
        } else {
            configMapper.updateById(config);
        }
    }

    public EarningsDTO getTodayEarnings(Long userId) {
        UserConfig config = getConfig(userId);
        if (config == null) {
            return new EarningsDTO(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0L, false);
        }

        ZoneId shanghai = ZoneId.of("Asia/Shanghai");
        LocalDate today = LocalDate.now(shanghai);
        LocalTime now = LocalTime.now(shanghai);
        LocalTime start = config.getWorkStartTime();
        LocalTime end = config.getWorkEndTime();

        if (start == null || end == null) {
            return new EarningsDTO(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0L, false);
        }

        BigDecimal dailyTotal = calcDailyTotal(config);
        boolean isWorkTime = !now.isBefore(start) && !now.isAfter(end);
        long remainingSeconds;

        if (isWorkTime) {
            remainingSeconds = Duration.between(now, end).getSeconds();
        } else if (now.isBefore(start)) {
            remainingSeconds = Duration.between(now, start).getSeconds();
        } else {
            remainingSeconds = 0;
        }

        BigDecimal earned = calcEarned(config, dailyTotal, now, isWorkTime, start, end);
        BigDecimal percentage = dailyTotal.compareTo(BigDecimal.ZERO) > 0
                ? earned.multiply(new BigDecimal("100")).divide(dailyTotal, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        updateDailyRecord(userId, today, earned);

        return new EarningsDTO(earned, dailyTotal, percentage, remainingSeconds, isWorkTime);
    }

    private BigDecimal calcDailyTotal(UserConfig config) {
        if ("MONTHLY".equals(config.getSalaryType()) && config.getMonthlySalary() != null) {
            BigDecimal workDays = new BigDecimal("21.75");
            return config.getMonthlySalary().divide(workDays, 2, RoundingMode.HALF_UP);
        } else if ("HOURLY".equals(config.getSalaryType()) && config.getHourlyRate() != null) {
            BigDecimal hours = config.getDailyWorkHours() != null ? config.getDailyWorkHours() : new BigDecimal("8");
            return config.getHourlyRate().multiply(hours);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calcEarned(UserConfig config, BigDecimal dailyTotal, LocalTime now,
                                  boolean isWorkTime, LocalTime start, LocalTime end) {
        if (!isWorkTime) {
            if (now.isBefore(start)) return BigDecimal.ZERO;
            return dailyTotal;
        }

        long totalWorkSeconds = Duration.between(start, end).getSeconds();
        long elapsedSeconds = Duration.between(start, now).getSeconds();
        if (totalWorkSeconds <= 0) return dailyTotal;

        return dailyTotal.multiply(new BigDecimal(elapsedSeconds))
                .divide(new BigDecimal(totalWorkSeconds), 2, RoundingMode.HALF_UP);
    }

    private void updateDailyRecord(Long userId, LocalDate date, BigDecimal earned) {
        LambdaQueryWrapper<DailyRecord> wrapper = new LambdaQueryWrapper<DailyRecord>()
                .eq(DailyRecord::getUserId, userId)
                .eq(DailyRecord::getRecordDate, date);
        DailyRecord record = dailyRecordMapper.selectOne(wrapper);
        if (record == null) {
            record = new DailyRecord();
            record.setUserId(userId);
            record.setRecordDate(date);
            record.setTotalEarned(earned);
            record.setIsWorkday(1);
            dailyRecordMapper.insert(record);
        } else {
            record.setTotalEarned(earned);
            dailyRecordMapper.updateById(record);
        }
    }
}
