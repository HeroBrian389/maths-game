// In /api/leaderboard/+server.ts
import { createClient } from '@vercel/kv'
import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private'
import type { RequestHandler } from '@sveltejs/kit'

const kv = createClient({
	url: KV_REST_API_URL,
	token: KV_REST_API_TOKEN
})

interface LeaderboardEntry {
  playerName: string;
  score: number;
  gameMode: string;
  date: string;
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const gameMode = url.searchParams.get('gameMode') || 'all';
    let leaderboardData;

    if (gameMode === 'all') {
      leaderboardData = await kv.zrange('leaderboard', 0, -1, {
        withScores: true,
        rev: true
      });
    } else {
      // Fetch only entries for the specific game mode
      leaderboardData = await kv.zrange(`leaderboard:${gameMode}`, 0, -1, {
        withScores: true,
        rev: true
      });
    }

    const leaderboard: LeaderboardEntry[] = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const [playerName, score, mode, date] = (leaderboardData[i] as string).split('|');
      leaderboard.push({
        playerName,
        score: Number(score),
        gameMode: mode,
        date
      });
    }

    // Sort by score and limit to top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);

    return new Response(JSON.stringify(top10), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};