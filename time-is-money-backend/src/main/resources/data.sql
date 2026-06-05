INSERT IGNORE INTO `user` (`id`, `openid`, `nickname`) VALUES (1, 'test_openid', '测试用户');
INSERT IGNORE INTO `user_config` (`user_id`, `salary_type`, `monthly_salary`, `hourly_rate`, `daily_work_hours`, `work_start_time`, `work_end_time`) VALUES (1, 'MONTHLY', 10000.00, 0, 8, '09:00:00', '18:00:00');
