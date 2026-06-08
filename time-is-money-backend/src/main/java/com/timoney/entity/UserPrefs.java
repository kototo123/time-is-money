package com.timoney.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.FieldFill;
import java.time.LocalDateTime;

@TableName("user_prefs")
public class UserPrefs {
    @TableId(type = IdType.INPUT)
    private Long userId;
    private String workDays;
    private String workDateOverrides;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getWorkDays() { return workDays; }
    public void setWorkDays(String workDays) { this.workDays = workDays; }
    public String getWorkDateOverrides() { return workDateOverrides; }
    public void setWorkDateOverrides(String workDateOverrides) { this.workDateOverrides = workDateOverrides; }
}
