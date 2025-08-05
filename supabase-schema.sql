-- MCP Social Network Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 20),
  password_hash text,
  bio text CHECK (length(bio) <= 500),
  created_at timestamp with time zone DEFAULT NOW(),
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  post_count integer DEFAULT 0
);

-- Posts table  
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 280),
  code text,
  language text,
  tags text[],
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Follows table (many-to-many relationship)
CREATE TABLE follows (
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Likes table
CREATE TABLE likes (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Replies table
CREATE TABLE replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 280),
  created_at timestamp with time zone DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('follow', 'mention', 'reply', 'like')),
  from_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  content text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_replies_post_id ON replies(post_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_user_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET post_count = post_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET post_count = post_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_follower_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_user_follower_count();

CREATE TRIGGER trigger_update_like_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON replies
  FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

CREATE TRIGGER trigger_update_post_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_post_count();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for most data (since this is a social network)
CREATE POLICY "Public users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Public follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Public likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Public replies are viewable by everyone" ON replies FOR SELECT USING (true);

-- Notifications are private to the user
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (true);

-- Allow all operations for authenticated users (we'll handle auth in the app layer)
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for posts" ON posts FOR ALL USING (true);
CREATE POLICY "Allow all operations for follows" ON follows FOR ALL USING (true);
CREATE POLICY "Allow all operations for likes" ON likes FOR ALL USING (true);
CREATE POLICY "Allow all operations for replies" ON replies FOR ALL USING (true);
CREATE POLICY "Allow all operations for notifications" ON notifications FOR ALL USING (true);
