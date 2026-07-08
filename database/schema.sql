-- schema.sql
-- Database schema for Sports Social Web Application.

CREATE DATABASE IF NOT EXISTS sports_social_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sports_social_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS post_hashtags;
DROP TABLE IF EXISTS hashtags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users: authentication & basic info.
CREATE TABLE users (
  user_id       INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  age           INT          NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- 2. Profiles: extended public user data (auto-created on register).
CREATE TABLE profiles (
  profile_id      INT          NOT NULL AUTO_INCREMENT,
  user_id         INT          NOT NULL UNIQUE,
  name            VARCHAR(100),
  age             INT,
  bio             TEXT,
  profile_picture VARCHAR(255),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Categories: predefined sport types.
CREATE TABLE categories (
  category_id INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (category_id)
) ENGINE=InnoDB;

-- 4. Posts: main social content.
CREATE TABLE posts (
  post_id     INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  category_id INT,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  image_url   VARCHAR(255),
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  INDEX idx_posts_user (user_id),
  INDEX idx_posts_created_at (created_at)
) ENGINE=InnoDB;

-- 5. Hashtags: flexible social tags.
CREATE TABLE hashtags (
  hashtag_id INT          NOT NULL AUTO_INCREMENT,
  tag        VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (hashtag_id)
) ENGINE=InnoDB;

-- 6. Post-Hashtag junction.
CREATE TABLE post_hashtags (
  post_id    INT NOT NULL,
  hashtag_id INT NOT NULL,
  PRIMARY KEY (post_id, hashtag_id),
  CONSTRAINT fk_post_hashtags_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_hashtags_hashtag
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(hashtag_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Comments: user feedback on posts.
CREATE TABLE comments (
  comment_id INT      NOT NULL AUTO_INCREMENT,
  user_id    INT      NOT NULL,
  post_id    INT      NOT NULL,
  text       TEXT     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  INDEX idx_comments_post (post_id)
) ENGINE=InnoDB;

-- 8. Likes: one per user per post (toggle).
CREATE TABLE likes (
  user_id    INT      NOT NULL,
  post_id    INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  CONSTRAINT fk_likes_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Shares: one per user per post (toggle).
CREATE TABLE shares (
  user_id    INT      NOT NULL,
  post_id    INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  CONSTRAINT fk_shares_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_shares_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB;
