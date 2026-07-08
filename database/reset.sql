-- reset.sql
-- Drops and recreates the database.
-- Run this when you want a clean database.

DROP DATABASE IF EXISTS sports_social_db;

CREATE DATABASE sports_social_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sports_social_db;
