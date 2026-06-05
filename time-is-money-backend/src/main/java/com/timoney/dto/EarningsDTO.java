package com.timoney.dto;

import java.math.BigDecimal;

public class EarningsDTO {
    private BigDecimal todayEarned;
    private BigDecimal todayTotal;
    private BigDecimal percentage;
    private long remainingSeconds;
    private Boolean isWorkTime;
    private BigDecimal perSecond;

    public EarningsDTO(BigDecimal todayEarned, BigDecimal todayTotal, BigDecimal percentage, long remainingSeconds, Boolean isWorkTime) {
        this.todayEarned = todayEarned;
        this.todayTotal = todayTotal;
        this.percentage = percentage;
        this.remainingSeconds = remainingSeconds;
        this.isWorkTime = isWorkTime;
    }

    public EarningsDTO(BigDecimal todayEarned, BigDecimal todayTotal, BigDecimal percentage, long remainingSeconds, Boolean isWorkTime, BigDecimal perSecond) {
        this.todayEarned = todayEarned;
        this.todayTotal = todayTotal;
        this.percentage = percentage;
        this.remainingSeconds = remainingSeconds;
        this.isWorkTime = isWorkTime;
        this.perSecond = perSecond;
    }

    public BigDecimal getTodayEarned() { return todayEarned; }
    public void setTodayEarned(BigDecimal todayEarned) { this.todayEarned = todayEarned; }
    public BigDecimal getTodayTotal() { return todayTotal; }
    public void setTodayTotal(BigDecimal todayTotal) { this.todayTotal = todayTotal; }
    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    public long getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(long remainingSeconds) { this.remainingSeconds = remainingSeconds; }
    public Boolean getIsWorkTime() { return isWorkTime; }
    public void setIsWorkTime(Boolean isWorkTime) { this.isWorkTime = isWorkTime; }
    public BigDecimal getPerSecond() { return perSecond; }
    public void setPerSecond(BigDecimal perSecond) { this.perSecond = perSecond; }
}
