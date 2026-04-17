/**
 * Seed Supabase with system videos from the /public folder.
 * Run: node scripts/seedSupabase.mjs
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * OR the Supabase Service Role key as SUPABASE_SERVICE_ROLE_KEY (preferred for seeding).
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------
// Location data
// ---------------------------------------------------------------
const LOCATIONS = {
  bali: {
    id: 'bali', name: 'Bali', country: 'Indonesia',
    lat: -8.3405, lng: 115.0920,
    token: 'BALI', color: '#10b981',
    categories: ['culture', 'nature', 'adventure', 'fun'],
    tags: ['Bali', 'Indonesia', 'Beach', 'Tropical'],
    creators: [
      { id: 'c_bali_1', username: 'bali_explorer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bali1', xp: 15420, earnings: 2340.5 },
      { id: 'c_bali_2', username: 'island_vibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bali2', xp: 9800, earnings: 1200 },
    ]
  },
  tokyo: {
    id: 'tokyo', name: 'Tokyo', country: 'Japan',
    lat: 35.6762, lng: 139.6503,
    token: 'TOKYO', color: '#ec4899',
    categories: ['culture', 'food', 'shopping', 'nightlife'],
    tags: ['Tokyo', 'Japan', 'Urban', 'Asia'],
    creators: [
      { id: 'c_tokyo_1', username: 'tokyo_vibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tokyo1', xp: 18900, earnings: 3210.9 },
      { id: 'c_tokyo_2', username: 'neon_streets', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tokyo2', xp: 12000, earnings: 2100 },
    ]
  },
  vegas: {
    id: 'vegas', name: 'Las Vegas', country: 'USA',
    lat: 36.1699, lng: -115.1398,
    token: 'VEGAS', color: '#f59e0b',
    categories: ['nightlife', 'fun', 'shopping', 'culture'],
    tags: ['Vegas', 'USA', 'Nightlife', 'Entertainment'],
    creators: [
      { id: 'c_vegas_1', username: 'vegas_nights', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vegas1', xp: 22100, earnings: 4567.8 },
      { id: 'c_vegas_2', username: 'highroller_cam', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vegas2', xp: 17500, earnings: 3800 },
    ]
  },
  safari: {
    id: 'safari', name: 'Maasai Mara', country: 'Kenya',
    lat: -1.5021, lng: 35.1448,
    token: 'SAFARI', color: '#8b5cf6',
    categories: ['nature', 'adventure', 'culture'],
    tags: ['Safari', 'Kenya', 'Africa', 'Wildlife'],
    creators: [
      { id: 'c_safari_1', username: 'safari_pro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=safari1', xp: 12300, earnings: 1890.4 },
      { id: 'c_safari_2', username: 'wildlens', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=safari2', xp: 9100, earnings: 1300 },
    ]
  },
  miami: {
    id: 'miami', name: 'Miami Beach', country: 'USA',
    lat: 25.7617, lng: -80.1918,
    token: 'MIAMI', color: '#f97316',
    categories: ['beach', 'nightlife', 'fun', 'food'],
    tags: ['Miami', 'USA', 'Beach', 'Nightlife'],
    creators: [
      { id: 'c_miami_1', username: 'miami_heat', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=miami1', xp: 19800, earnings: 3890.2 },
      { id: 'c_miami_2', username: 'beach_queen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=miami2', xp: 14200, earnings: 2600 },
    ]
  },
  paris: {
    id: 'paris', name: 'Paris', country: 'France',
    lat: 48.8566, lng: 2.3522,
    token: 'PARIS', color: '#3b82f6',
    categories: ['culture', 'food', 'shopping', 'romance'],
    tags: ['Paris', 'France', 'Europe', 'Culture'],
    creators: [
      { id: 'c_paris_1', username: 'paris_vibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=paris1', xp: 12300, earnings: 1890.25 },
      { id: 'c_paris_2', username: 'bonjour_traveler', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=paris2', xp: 8900, earnings: 1100 },
    ]
  },
  maldives: {
    id: 'maldives', name: 'Maldives', country: 'Maldives',
    lat: 3.2028, lng: 73.2207,
    token: 'MALD', color: '#06b6d4',
    categories: ['beach', 'nature', 'adventure', 'fun'],
    tags: ['Maldives', 'Beach', 'Ocean', 'Tropical'],
    creators: [
      { id: 'c_maldives_1', username: 'ocean_dreams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maldives1', xp: 16700, earnings: 3100 },
      { id: 'c_maldives_2', username: 'azure_lens', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maldives2', xp: 11200, earnings: 1800 },
    ]
  },
  barcelona: {
    id: 'barcelona', name: 'Barcelona', country: 'Spain',
    lat: 41.3851, lng: 2.1734,
    token: 'BARCA', color: '#a855f7',
    categories: ['culture', 'food', 'nightlife', 'beach'],
    tags: ['Barcelona', 'Spain', 'Europe', 'Culture'],
    creators: [
      { id: 'c_bcn_1', username: 'bcn_explorer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bcn1', xp: 13500, earnings: 2400 },
      { id: 'c_bcn_2', username: 'tapas_traveler', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bcn2', xp: 10100, earnings: 1550 },
    ]
  }
};

// ---------------------------------------------------------------
// Map each public video file → location
// ---------------------------------------------------------------
const VIDEO_LOCATION_MAP = [
  // Bali (7 videos)
  { file: '145582-787247932_tiny.mp4', loc: 'bali' },
  { file: '148063-793513341_tiny.mp4', loc: 'bali' },
  { file: '153527-805386151_tiny.mp4', loc: 'bali' },
  { file: '165071-831695787_tiny.mp4', loc: 'bali' },
  { file: '171184-844787980_tiny.mp4', loc: 'bali' },
  { file: '190055-887039408_tiny.mp4', loc: 'bali' },
  { file: '197679-905378310_tiny.mp4', loc: 'bali' },
  // Tokyo (7 videos)
  { file: '197712-905378419_tiny.mp4', loc: 'tokyo' },
  { file: '199940-911694823_tiny.mp4', loc: 'tokyo' },
  { file: '200297-912370117_tiny.mp4', loc: 'tokyo' },
  { file: '200506-917314698_tiny.mp4', loc: 'tokyo' },
  { file: '201016-914542899_tiny.mp4', loc: 'tokyo' },
  { file: '201281-915375202_tiny.mp4', loc: 'tokyo' },
  { file: '204389-924209309_tiny.mp4', loc: 'tokyo' },
  // Vegas (6 videos)
  { file: '206135_tiny.mp4', loc: 'vegas' },
  { file: '206138_tiny.mp4', loc: 'vegas' },
  { file: '206294_tiny.mp4', loc: 'vegas' },
  { file: '207755_tiny.mp4', loc: 'vegas' },
  { file: '208297_tiny.mp4', loc: 'vegas' },
  { file: '208634_tiny.mp4', loc: 'vegas' },
  // Safari (5 videos)
  { file: '208635_tiny.mp4', loc: 'safari' },
  { file: '210905_tiny.mp4', loc: 'safari' },
  { file: '213039_tiny.mp4', loc: 'safari' },
  { file: '215019_tiny.mp4', loc: 'safari' },
  { file: '216447_tiny.mp4', loc: 'safari' },
  // Miami (6 videos)
  { file: '218013_tiny.mp4', loc: 'miami' },
  { file: '220305_tiny.mp4', loc: 'miami' },
  { file: '221920_tiny.mp4', loc: 'miami' },
  { file: '221921_tiny.mp4', loc: 'miami' },
  { file: '225284_tiny.mp4', loc: 'miami' },
  { file: '228178_tiny.mp4', loc: 'miami' },
  // Paris (5 videos)
  { file: '228930_tiny.mp4', loc: 'paris' },
  { file: '229256_tiny.mp4', loc: 'paris' },
  { file: '229257_tiny.mp4', loc: 'paris' },
  { file: '230247_tiny.mp4', loc: 'paris' },
  { file: '231806_tiny.mp4', loc: 'paris' },
  // Maldives (5 videos)
  { file: '240337_tiny.mp4', loc: 'maldives' },
  { file: '262347_tiny.mp4', loc: 'maldives' },
  { file: '262603_tiny.mp4', loc: 'maldives' },
  { file: '264948_tiny.mp4', loc: 'maldives' },
  { file: '266987_tiny.mp4', loc: 'maldives' },
  // Barcelona (5 videos)
  { file: '268727_tiny.mp4', loc: 'barcelona' },
  { file: '281680_tiny.mp4', loc: 'barcelona' },
  { file: '296958_tiny.mp4', loc: 'barcelona' },
  { file: '298643_tiny.mp4', loc: 'barcelona' },
  { file: '302095_tiny.mp4', loc: 'barcelona' },
];

// ---------------------------------------------------------------
// Stream tags to seed
// ---------------------------------------------------------------
const STREAM_TAGS_SEED = [
  { tag_id: 'tag_bali',      name: 'Bali',      display_name: '#Bali',      color: '#10b981', video_count: 7,  total_xp: 42000 },
  { tag_id: 'tag_tokyo',     name: 'Tokyo',     display_name: '#Tokyo',     color: '#ec4899', video_count: 7,  total_xp: 54300 },
  { tag_id: 'tag_vegas',     name: 'Vegas',     display_name: '#Vegas',     color: '#f59e0b', video_count: 6,  total_xp: 67800 },
  { tag_id: 'tag_safari',    name: 'Safari',    display_name: '#Safari',    color: '#8b5cf6', video_count: 5,  total_xp: 32100 },
  { tag_id: 'tag_miami',     name: 'Miami',     display_name: '#Miami',     color: '#f97316', video_count: 6,  total_xp: 48000 },
  { tag_id: 'tag_paris',     name: 'Paris',     display_name: '#Paris',     color: '#3b82f6', video_count: 5,  total_xp: 38000 },
  { tag_id: 'tag_maldives',  name: 'Maldives',  display_name: '#Maldives',  color: '#06b6d4', video_count: 5,  total_xp: 41000 },
  { tag_id: 'tag_barcelona', name: 'Barcelona', display_name: '#Barcelona', color: '#a855f7', video_count: 5,  total_xp: 36000 },
  { tag_id: 'tag_beach',     name: 'Beach',     display_name: '#Beach',     color: '#0ea5e9', video_count: 18, total_xp: 95000 },
  { tag_id: 'tag_tropical',  name: 'Tropical',  display_name: '#Tropical',  color: '#84cc16', video_count: 12, total_xp: 62000 },
  { tag_id: 'tag_wildlife',  name: 'Wildlife',  display_name: '#Wildlife',  color: '#65a30d', video_count: 5,  total_xp: 32100 },
  { tag_id: 'tag_nightlife', name: 'Nightlife', display_name: '#Nightlife', color: '#9333ea', video_count: 11, total_xp: 74000 },
];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function videoId(filename) {
  return filename.replace('.mp4', '').replace(/_tiny$/, '').replace(/-/g, '_');
}

async function seedStreamTags() {
  console.log('🏷️  Seeding stream tags...');
  const { error } = await supabase
    .from('stream_tags')
    .upsert(STREAM_TAGS_SEED, { onConflict: 'tag_id' });

  if (error) {
    console.error('❌ Failed to seed stream tags:', error.message);
    throw error;
  }
  console.log(`✅ Seeded ${STREAM_TAGS_SEED.length} stream tags`);
}

async function seedVideos() {
  console.log('🎬 Seeding system videos...');

  const rows = VIDEO_LOCATION_MAP.map(({ file, loc }) => {
    const location = LOCATIONS[loc];
    const creator = pick(location.creators);
    const views = randInt(20000, 300000);
    const likes = randInt(1000, Math.floor(views * 0.12));
    const bettingPool = randInt(5000, 80000);
    const viralityScore = Math.min(100, ((views / 1000) * 0.4 + (likes / 100) * 0.35 + (bettingPool / 10000) * 0.25) * 0.5);
    const tokenPrice = parseFloat(rand(0.1, 5).toFixed(4));
    const tokenChange = parseFloat(rand(-20, 30).toFixed(2));
    const tokenHolders = randInt(500, 50000);

    return {
      video_id:              videoId(file),
      video_url:             `/${file}`,
      location_id:           location.id,
      location_name:         location.name,
      country:               location.country,
      lat:                   location.lat,
      lng:                   location.lng,
      creator_id:            creator.id,
      creator_username:      creator.username,
      creator_avatar:        creator.avatar,
      creator_xp_points:     creator.xp,
      creator_total_earnings: creator.earnings,
      thumbnail_url:         null,
      duration:              randInt(15, 60),
      views,
      likes,
      virality_score:        parseFloat(viralityScore.toFixed(1)),
      token_symbol:          location.token,
      token_price:           tokenPrice,
      token_change_24h:      tokenChange,
      token_volume:          parseFloat(rand(50000, 500000).toFixed(0)),
      token_holders:         tokenHolders,
      token_market_cap:      parseFloat((tokenPrice * tokenHolders * 1000).toFixed(0)),
      betting_pool:          bettingPool,
      paid_to_post:          parseFloat(rand(0.05, 0.5).toFixed(3)),
      categories:            location.categories,
      stream_tags:           location.tags,
      xp_earned:             randInt(50, 500),
      is_system_video:       true,
    };
  });

  // Insert in batches of 20
  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('videos')
      .upsert(batch, { onConflict: 'video_id' });

    if (error) {
      console.error(`❌ Batch ${i}–${i + BATCH} failed:`, error.message);
      throw error;
    }
    console.log(`  ✔ Inserted videos ${i + 1}–${Math.min(i + BATCH, rows.length)}`);
  }

  console.log(`✅ Seeded ${rows.length} system videos`);
}

async function main() {
  console.log('🚀 TravelStreams Supabase Seeder');
  console.log(`📡 URL: ${supabaseUrl}`);
  console.log('');

  try {
    await seedStreamTags();
    await seedVideos();
    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    console.error('\n💡 Make sure you have run the SQL migration in Supabase first:');
    console.error('   supabase/migrations/001_initial_schema.sql');
    process.exit(1);
  }
}

main();
