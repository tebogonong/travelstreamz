-- =============================================================
-- TravelStreams Supabase Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/jrwosiyhnaifkcscbpho/sql
-- =============================================================

-- ---------------------------------------------------------------
-- 1. VIDEOS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id              TEXT        UNIQUE NOT NULL,
  video_url             TEXT        NOT NULL,
  location_id           TEXT        NOT NULL,
  location_name         TEXT        NOT NULL,
  country               TEXT        NOT NULL DEFAULT '',
  lat                   FLOAT       DEFAULT 0,
  lng                   FLOAT       DEFAULT 0,
  creator_id            TEXT        NOT NULL DEFAULT 'system',
  creator_username      TEXT        NOT NULL DEFAULT 'travelstreams',
  creator_avatar        TEXT        NOT NULL DEFAULT '',
  creator_xp_points     INTEGER     DEFAULT 0,
  creator_total_earnings FLOAT      DEFAULT 0,
  thumbnail_url         TEXT,
  duration              INTEGER     NOT NULL DEFAULT 30,
  views                 INTEGER     DEFAULT 0,
  likes                 INTEGER     DEFAULT 0,
  virality_score        FLOAT       DEFAULT 0,
  token_symbol          TEXT        DEFAULT '',
  token_price           FLOAT       DEFAULT 0,
  token_change_24h      FLOAT       DEFAULT 0,
  token_volume          FLOAT       DEFAULT 0,
  token_holders         INTEGER     DEFAULT 0,
  token_market_cap      FLOAT       DEFAULT 0,
  betting_pool          FLOAT       DEFAULT 0,
  paid_to_post          FLOAT       DEFAULT 0,
  categories            TEXT[]      DEFAULT '{}',
  stream_tags           TEXT[]      DEFAULT '{}',
  xp_earned             INTEGER     DEFAULT 0,
  is_system_video       BOOLEAN     DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2. VIDEO LIKES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_likes (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id      TEXT        NOT NULL,
  user_address  TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_address)
);

-- ---------------------------------------------------------------
-- 3. VIDEO VIEWS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_views (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id      TEXT        NOT NULL,
  user_address  TEXT,
  session_id    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. BETS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bets (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id      TEXT        NOT NULL,
  user_address  TEXT        NOT NULL,
  amount        FLOAT       NOT NULL,
  prediction    TEXT        NOT NULL CHECK (prediction IN ('viral', 'winner')),
  status        TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  tx_hash       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 5. VIDEO SUBMISSIONS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_submissions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  embed_url         TEXT        NOT NULL,
  location          TEXT        NOT NULL,
  country           TEXT,
  categories        TEXT[]      DEFAULT '{}',
  stream_tags       TEXT[]      DEFAULT '{}',
  submitter_address TEXT,
  status            TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  paid_amount       FLOAT       DEFAULT 0,
  tx_hash           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 6. STREAM TAGS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stream_tags (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id       TEXT        UNIQUE NOT NULL,
  name         TEXT        NOT NULL,
  display_name TEXT        NOT NULL,
  color        TEXT        NOT NULL DEFAULT '#6366f1',
  video_count  INTEGER     DEFAULT 0,
  total_xp     INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 7. INDEXES
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_videos_stream_tags       ON videos USING GIN(stream_tags);
CREATE INDEX IF NOT EXISTS idx_videos_categories        ON videos USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_videos_location_id       ON videos(location_id);
CREATE INDEX IF NOT EXISTS idx_videos_virality          ON videos(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id     ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user         ON video_likes(user_address);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id     ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_bets_video_id            ON bets(video_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_address        ON bets(user_address);

-- ---------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- ---------------------------------------------------------------
ALTER TABLE videos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_tags       ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "public_read_videos"       ON videos;
DROP POLICY IF EXISTS "public_read_stream_tags"  ON stream_tags;
DROP POLICY IF EXISTS "public_insert_views"      ON video_views;
DROP POLICY IF EXISTS "public_insert_likes"      ON video_likes;
DROP POLICY IF EXISTS "public_delete_likes"      ON video_likes;
DROP POLICY IF EXISTS "public_read_likes"        ON video_likes;
DROP POLICY IF EXISTS "public_insert_bets"       ON bets;
DROP POLICY IF EXISTS "public_insert_submissions" ON video_submissions;

-- Videos: anyone can read
CREATE POLICY "public_read_videos"       ON videos            FOR SELECT USING (true);
-- Stream tags: anyone can read
CREATE POLICY "public_read_stream_tags"  ON stream_tags       FOR SELECT USING (true);
-- Views: anyone can insert
CREATE POLICY "public_insert_views"      ON video_views       FOR INSERT WITH CHECK (true);
-- Likes: anyone can read/insert/delete
CREATE POLICY "public_read_likes"        ON video_likes       FOR SELECT USING (true);
CREATE POLICY "public_insert_likes"      ON video_likes       FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_likes"      ON video_likes       FOR DELETE USING (true);
-- Bets: anyone can insert
CREATE POLICY "public_insert_bets"       ON bets              FOR INSERT WITH CHECK (true);
-- Submissions: anyone can insert
CREATE POLICY "public_insert_submissions" ON video_submissions FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------
-- 9. HELPER FUNCTIONS
-- ---------------------------------------------------------------

-- Increment views
CREATE OR REPLACE FUNCTION increment_video_views(p_video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = views + 1, updated_at = NOW()
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment likes
CREATE OR REPLACE FUNCTION increment_video_likes(p_video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET likes = likes + 1, updated_at = NOW()
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement likes
CREATE OR REPLACE FUNCTION decrement_video_likes(p_video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET likes = GREATEST(0, likes - 1), updated_at = NOW()
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment betting pool
CREATE OR REPLACE FUNCTION increment_betting_pool(p_video_id TEXT, p_amount FLOAT)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET betting_pool = betting_pool + p_amount, updated_at = NOW()
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate virality score based on views, likes, bets
CREATE OR REPLACE FUNCTION recalculate_virality(p_video_id TEXT)
RETURNS void AS $$
DECLARE
  v_views  INTEGER;
  v_likes  INTEGER;
  v_bets   FLOAT;
  v_score  FLOAT;
BEGIN
  SELECT views, likes, betting_pool INTO v_views, v_likes, v_bets
  FROM videos WHERE video_id = p_video_id;

  v_score := LEAST(100, (
    (v_views  / 1000.0)  * 0.4 +
    (v_likes  / 100.0)   * 0.35 +
    (v_bets   / 10000.0) * 0.25
  ) * 100);

  UPDATE videos SET virality_score = v_score, updated_at = NOW()
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 10. UPDATED_AT TRIGGER
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_videos_updated_at ON videos;
CREATE TRIGGER set_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
