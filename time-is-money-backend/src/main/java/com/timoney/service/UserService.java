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
            config.setLunchStart(LocalTime.of(12, 0));
            config.setLunchEnd(LocalTime.of(13, 0));
            config.setWorkDaysPerWeek(5);
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
        config.setLunchStart(dto.getLunchStart());
        config.setLunchEnd(dto.getLunchEnd());
        config.setWorkDaysPerWeek(dto.getWorkDaysPerWeek());

        if (config.getId() == null) {
            configMapper.insert(config);
        } else {
            configMapper.updateById(config);
        }
    }

    public EarningsDTO getTodayEarnings(Long userId) {
        UserConfig config = getConfig(userId);
        if (config == null) {
            return new EarningsDTO(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0L, false, BigDecimal.ZERO);
        }

        ZoneId shanghai = ZoneId.of("Asia/Shanghai");
        LocalDate today = LocalDate.now(shanghai);
        LocalTime now = LocalTime.now(shanghai);
        LocalTime start = config.getWorkStartTime();
        LocalTime end = config.getWorkEndTime();

        if (start == null || end == null) {
            return new EarningsDTO(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0L, false, BigDecimal.ZERO);
        }

        BigDecimal dailyTotal = calcDailyTotal(config);
        long totalWorkSeconds = calcTotalWorkSeconds(config);
        BigDecimal perSecond = totalWorkSeconds > 0
                ? dailyTotal.divide(new BigDecimal(totalWorkSeconds), 6, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long remainingSeconds;
        BigDecimal earned;

        if (now.isBefore(start)) {
            remainingSeconds = Duration.between(now, start).getSeconds();
            earned = BigDecimal.ZERO;
        } else if (now.isAfter(end)) {
            remainingSeconds = 0;
            earned = dailyTotal;
        } else {
            long elapsed = calcElapsedWorkSeconds(config, start, now);
            earned = perSecond.multiply(new BigDecimal(elapsed)).setScale(4, RoundingMode.HALF_UP);
            remainingSeconds = totalWorkSeconds - elapsed;
        }

        boolean isInLunch = isDuringLunch(config, now);
        boolean isWorkTime = !now.isBefore(start) && !now.isAfter(end) && !isInLunch;

        BigDecimal percentage = dailyTotal.compareTo(BigDecimal.ZERO) > 0
                ? earned.multiply(new BigDecimal("100")).divide(dailyTotal, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        updateDailyRecord(userId, today, earned);

        return new EarningsDTO(earned, dailyTotal, percentage, remainingSeconds, isWorkTime, perSecond);
    }

    private boolean isDuringLunch(UserConfig config, LocalTime now) {
        LocalTime lunchStart = config.getLunchStart();
        LocalTime lunchEnd = config.getLunchEnd();
        if (lunchStart == null || lunchEnd == null) return false;
        return !now.isBefore(lunchStart) && now.isBefore(lunchEnd);
    }

    private long calcTotalWorkSeconds(UserConfig config) {
        LocalTime start = config.getWorkStartTime();
        LocalTime end = config.getWorkEndTime();
        long total = Duration.between(start, end).getSeconds();
        if (total <= 0) return 0;

        LocalTime lunchStart = config.getLunchStart();
        LocalTime lunchEnd = config.getLunchEnd();
        if (lunchStart != null && lunchEnd != null) {
            long lunchDuration = Duration.between(lunchStart, lunchEnd).getSeconds();
            if (lunchDuration > 0) total -= lunchDuration;
        }
        return Math.max(total, 0);
    }

    private long calcElapsedWorkSeconds(UserConfig config, LocalTime start, LocalTime now) {
        long elapsed = Duration.between(start, now).getSeconds();
        LocalTime lunchStart = config.getLunchStart();
        LocalTime lunchEnd = config.getLunchEnd();
        if (lunchStart != null && lunchEnd != null && now.isAfter(lunchStart)) {
            long lunchDuration = Duration.between(lunchStart, lunchEnd).getSeconds();
            if (lunchDuration > 0) {
                if (now.isBefore(lunchEnd)) {
                    elapsed -= Duration.between(lunchStart, now).getSeconds();
                } else {
                    elapsed -= lunchDuration;
                }
            }
        }
        return Math.max(elapsed, 0);
    }

    private BigDecimal calcDailyTotal(UserConfig config) {
        if ("MONTHLY".equals(config.getSalaryType()) && config.getMonthlySalary() != null) {
            int daysPerWeek = config.getWorkDaysPerWeek() != null && config.getWorkDaysPerWeek() > 0
                    ? config.getWorkDaysPerWeek() : 5;
            double monthlyWorkDays = daysPerWeek * 52.0 / 12.0;
            return config.getMonthlySalary().divide(new BigDecimal(monthlyWorkDays), 2, RoundingMode.HALF_UP);
        } else if ("HOURLY".equals(config.getSalaryType()) && config.getHourlyRate() != null) {
            BigDecimal hours = config.getDailyWorkHours() != null ? config.getDailyWorkHours() : new BigDecimal("8");
            return config.getHourlyRate().multiply(hours);
        }
        return BigDecimal.ZERO;
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
