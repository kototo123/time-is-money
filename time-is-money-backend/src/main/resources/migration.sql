ALTER TABLE user_config ADD COLUMN work_days VARCHAR(20) DEFAULT '1,2,3,4,5';
ALTER TABLE user_config ADD COLUMN work_date_overrides VARCHAR(500) DEFAULT '';
