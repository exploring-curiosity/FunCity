-- ============================================
-- FunCity Reddit Clone — Full DB Setup
-- Paste this entire file into Supabase SQL Editor
-- ============================================

-- 1. SCHEMA

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  password_hash text NOT NULL,
  age_group text NOT NULL CHECK (age_group IN ('13-17', '18-24', '25-34', '35-44', '45-54', '55+')),
  country text NOT NULL,
  nyc_familiarity text NOT NULL CHECK (nyc_familiarity IN ('never_been', 'visited', 'live_here')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subreddits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#00f0ff',
  emoji text NOT NULL DEFAULT '📌',
  type text NOT NULL CHECK (type IN ('borough', 'category')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) <= 300),
  body text,
  image_url text,
  subreddit_id uuid NOT NULL REFERENCES subreddits(id),
  author_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_post ON votes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_comment ON votes(user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_subreddit ON posts(subreddit_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_votes_post ON votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment ON votes(comment_id);

-- 2. RLS POLICIES

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON users FOR SELECT USING (true);

CREATE POLICY "Allow anon select" ON subreddits FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON posts FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON comments FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow anon update" ON votes FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON votes FOR DELETE USING (true);

-- 3. SEED SUBREDDITS

INSERT INTO subreddits (name, display_name, description, color, emoji, type) VALUES
('manhattan', 'Manhattan', 'The heart of NYC — skyscrapers, culture, and endless energy', '#ff6b6b', '🏙️', 'borough'),
('brooklyn', 'Brooklyn', 'Hip neighborhoods, street art, and the best pizza debates', '#cc5de8', '🌉', 'borough'),
('queens', 'Queens', 'The world''s borough — the most diverse place on earth', '#ffa94d', '🌍', 'borough'),
('bronx', 'The Bronx', 'Birthplace of hip-hop, home of the Yankees, real NYC grit', '#20c997', '🎤', 'borough'),
('staten-island', 'Staten Island', 'The forgotten borough with hidden gems and ferry views', '#868e96', '⛴️', 'borough'),
('food', 'Food & Eats', 'Where to eat, what to try, and hot takes on NYC food', '#ff6b6b', '🍕', 'category'),
('art', 'Art & Culture', 'Museums, galleries, street art, and performances', '#cc5de8', '🎨', 'category'),
('nightlife', 'Nightlife', 'Bars, clubs, rooftops, and late-night adventures', '#ff006e', '🌙', 'category'),
('hidden-gems', 'Hidden Gems', 'Secret spots only locals know about', '#00f0ff', '💎', 'category'),
('nature', 'Nature & Parks', 'Green spaces, waterfront walks, and outdoor escapes', '#51cf66', '🌿', 'category');

-- 4. SEED DEMO USER (password: "demo1234", bcrypt hash)
INSERT INTO users (id, username, password_hash, age_group, country, nyc_familiarity) VALUES
('00000000-0000-0000-0000-000000000001', 'nyclocal', '$2a$10$rQKBcLvqEYzF8zOqXRfNUOaGEjP3QMJzGqOGDqBdVLz8sQzHYjLRu', '25-34', 'United States', 'live_here');

-- 5. SEED SAMPLE POSTS
INSERT INTO posts (title, body, subreddit_id, author_id) VALUES
('Joe''s Pizza is still the GOAT 🍕', 'Been going here for 15 years. Nothing beats a classic slice at 3am after a night out. Fight me.', (SELECT id FROM subreddits WHERE name = 'manhattan'), '00000000-0000-0000-0000-000000000001'),
('Best ramen in Brooklyn?', 'Just moved to Williamsburg. Looking for authentic ramen spots. Ippudo doesn''t count.', (SELECT id FROM subreddits WHERE name = 'brooklyn'), '00000000-0000-0000-0000-000000000001'),
('The Met is free (sort of)', 'Reminder: The Met''s admission is "pay what you wish" for NY residents. You can literally pay $1.', (SELECT id FROM subreddits WHERE name = 'art'), '00000000-0000-0000-0000-000000000001'),
('Flushing food crawl recommendations?', 'Taking some friends on a Flushing food tour this weekend. Must-hit spots?', (SELECT id FROM subreddits WHERE name = 'queens'), '00000000-0000-0000-0000-000000000001'),
('House of Yes never disappoints', 'Went to the Saturday night party. Incredible performers, great crowd, always a vibe.', (SELECT id FROM subreddits WHERE name = 'nightlife'), '00000000-0000-0000-0000-000000000001'),
('The Cloisters is NYC''s best kept secret', 'Medieval art museum in a castle overlooking the Hudson. Free with Met admission. Most tourists have no idea.', (SELECT id FROM subreddits WHERE name = 'hidden-gems'), '00000000-0000-0000-0000-000000000001'),
('Central Park in fall is unmatched', 'Just did the full loop today. The colors right now are absolutely insane. Go before it gets cold!', (SELECT id FROM subreddits WHERE name = 'nature'), '00000000-0000-0000-0000-000000000001'),
('Bronx Zoo free Wednesdays!', 'PSA: The Bronx Zoo is free on Wednesdays (pay what you wish). Get there early though, it gets packed.', (SELECT id FROM subreddits WHERE name = 'bronx'), '00000000-0000-0000-0000-000000000001'),
('Staten Island Ferry — best free thing in NYC', 'Tourists pay hundreds for boat tours. Meanwhile this ferry is free and you get incredible views of the Statue of Liberty.', (SELECT id FROM subreddits WHERE name = 'staten-island'), '00000000-0000-0000-0000-000000000001'),
('Unpopular opinion: Times Square isn''t that bad', 'Yeah it''s touristy but the energy is wild. Sometimes you just need to embrace the chaos.', (SELECT id FROM subreddits WHERE name = 'manhattan'), '00000000-0000-0000-0000-000000000001');
