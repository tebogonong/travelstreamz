import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ---------------------------------------------------------------
// Like / Unlike a video
// ---------------------------------------------------------------
export function useVideoLike(videoId: string, userAddress: string | undefined) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const { toast } = useToast();

  // Check initial like status + fetch count
  useEffect(() => {
    if (!videoId) return;

    const loadStatus = async () => {
      // Fetch current like count from videos table
      const { data: videoData } = await supabase
        .from('videos')
        .select('likes')
        .eq('video_id', videoId)
        .maybeSingle();

      if (videoData) setLikeCount(videoData.likes);

      // Check if user has liked
      if (userAddress) {
        const { data } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', videoId)
          .eq('user_address', userAddress)
          .maybeSingle();
        setLiked(!!data);
      }
    };

    loadStatus();
  }, [videoId, userAddress]);

  const toggleLike = useCallback(async () => {
    if (!userAddress) {
      toast({ title: 'Connect wallet', description: 'Connect your wallet to like videos.', variant: 'destructive' });
      return;
    }

    if (liked) {
      // Unlike
      setLiked(false);
      setLikeCount(prev => (prev !== null ? Math.max(0, prev - 1) : null));

      const { error } = await supabase
        .from('video_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_address', userAddress);

      if (!error) {
        await supabase.rpc('decrement_video_likes', { p_video_id: videoId });
      } else {
        // Revert optimistic update
        setLiked(true);
        setLikeCount(prev => (prev !== null ? prev + 1 : null));
      }
    } else {
      // Like
      setLiked(true);
      setLikeCount(prev => (prev !== null ? prev + 1 : null));

      const { error } = await supabase
        .from('video_likes')
        .insert({ video_id: videoId, user_address: userAddress });

      if (!error) {
        await supabase.rpc('increment_video_likes', { p_video_id: videoId });
      } else {
        // Revert optimistic update
        setLiked(false);
        setLikeCount(prev => (prev !== null ? Math.max(0, prev - 1) : null));
      }
    }
  }, [liked, videoId, userAddress, toast]);

  return { liked, likeCount, toggleLike };
}

// ---------------------------------------------------------------
// Record a view (debounced – only fires once per video session)
// ---------------------------------------------------------------
const viewedThisSession = new Set<string>();

export function useVideoView(videoId: string, userAddress: string | undefined) {
  useEffect(() => {
    if (!videoId || viewedThisSession.has(videoId)) return;
    viewedThisSession.add(videoId);

    const sessionId = sessionStorage.getItem('vg_session_id') ?? (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem('vg_session_id', id);
      return id;
    })();

    // Fire-and-forget
    supabase
      .from('video_views')
      .insert({ video_id: videoId, user_address: userAddress ?? null, session_id: sessionId })
      .then(() => supabase.rpc('increment_video_views', { p_video_id: videoId }));
  }, [videoId, userAddress]);
}

// ---------------------------------------------------------------
// Place a bet on a video
// ---------------------------------------------------------------
export function usePlaceBet() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const placeBet = useCallback(async (
    videoId: string,
    userAddress: string,
    amount: number,
    prediction: 'viral' | 'winner',
    txHash?: string
  ): Promise<boolean> => {
    if (!userAddress) {
      toast({ title: 'Connect wallet', description: 'Connect your wallet to place bets.', variant: 'destructive' });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bets')
        .insert({ video_id: videoId, user_address: userAddress, amount, prediction, tx_hash: txHash ?? null });

      if (error) throw error;

      // Update betting pool
      await supabase.rpc('increment_betting_pool', { p_video_id: videoId, p_amount: amount });

      toast({ title: 'Bet placed! 🎰', description: `$${amount} on ${prediction === 'viral' ? 'going viral' : 'winner'}` });
      return true;
    } catch (err) {
      console.error('Bet error:', err);
      toast({ title: 'Bet failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { placeBet, loading };
}

// ---------------------------------------------------------------
// Fetch user's bets
// ---------------------------------------------------------------
export function useUserBets(userAddress: string | undefined) {
  const [bets, setBets] = useState<Array<{
    id: string; video_id: string; amount: number;
    prediction: string; status: string; created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) { setBets([]); return; }

    setLoading(true);
    supabase
      .from('bets')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBets(data ?? []); setLoading(false); });
  }, [userAddress]);

  return { bets, loading };
}

// ---------------------------------------------------------------
// Submit a content URL for review
// ---------------------------------------------------------------
export function useContentSubmission() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitContent = useCallback(async (params: {
    embedUrl: string;
    location: string;
    country?: string;
    categories: string[];
    streamTags: string[];
    submitterAddress?: string;
    paidAmount?: number;
    txHash?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.from('video_submissions').insert({
        embed_url:         params.embedUrl,
        location:          params.location,
        country:           params.country ?? null,
        categories:        params.categories,
        stream_tags:       params.streamTags,
        submitter_address: params.submitterAddress ?? null,
        paid_amount:       params.paidAmount ?? 0,
        tx_hash:           params.txHash ?? null,
      });

      if (error) throw error;

      toast({ title: 'Content Submitted! 🎉', description: `Your content for ${params.location} is under review.` });
      return true;
    } catch (err) {
      console.error('Submission error:', err);
      toast({ title: 'Submission failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { submitContent, loading };
}

// ---------------------------------------------------------------
// Fetch stream tags from Supabase
// ---------------------------------------------------------------
export function useStreamTags() {
  const [tags, setTags] = useState<Array<{
    tagId: string; name: string; displayName: string;
    color: string; videoCount: number; totalXP: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('stream_tags')
      .select('*')
      .order('video_count', { ascending: false })
      .then(({ data }) => {
        setTags((data ?? []).map(row => ({
          tagId: row.tag_id,
          name: row.name,
          displayName: row.display_name,
          color: row.color,
          videoCount: row.video_count,
          totalXP: row.total_xp,
        })));
        setLoading(false);
      });
  }, []);

  return { tags, loading };
}

// ---------------------------------------------------------------
// Fetch real-time video stats (views, likes, betting pool)
// ---------------------------------------------------------------
export function useVideoStats(videoId: string) {
  const [stats, setStats] = useState<{ views: number; likes: number; bettingPool: number } | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchStats = () =>
      supabase
        .from('videos')
        .select('views, likes, betting_pool')
        .eq('video_id', videoId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setStats({ views: data.views, likes: data.likes, bettingPool: data.betting_pool });
        });

    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`video_stats_${videoId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'videos',
        filter: `video_id=eq.${videoId}`,
      }, payload => {
        const r = payload.new as { views: number; likes: number; betting_pool: number };
        setStats({ views: r.views, likes: r.likes, bettingPool: r.betting_pool });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [videoId]);

  return stats;
}
