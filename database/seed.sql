-- seed.sql
-- Starter data for Sports Social Web Application.
-- Run this after schema.sql.

USE sports_social_db;

-- Predefined sport categories.
INSERT INTO categories (name) VALUES
  ('Football'),
  ('Basketball'),
  ('Tennis'),
  ('Volleyball'),
  ('Running'),
  ('Gym'),
  ('Cycling');
