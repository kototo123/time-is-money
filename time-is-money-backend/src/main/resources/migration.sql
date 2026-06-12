CREATE TABLE IF NOT EXISTS `user_prefs` (
  `user_id` BIGINT PRIMARY KEY,
  `work_days` VARCHAR(20) DEFAULT '1,2,3,4,5',
  `work_date_overrides` VARCHAR(500) DEFAULT '',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM `user_config` WHERE `id` NOT IN (
  SELECT `id` FROM (
    SELECT MIN(`id`) AS `id` FROM `user_config` GROUP BY `user_id`
  ) AS `t`
);
ALTER TABLE `user_config` ADD UNIQUE KEY `uk_user_id` (`user_id`);
