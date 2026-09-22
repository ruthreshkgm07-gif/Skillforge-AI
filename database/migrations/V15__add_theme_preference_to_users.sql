-- V15__add_theme_preference_to_users.sql
-- Add theme_preference column to users table for persisting theme choice across devices

ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'system';
