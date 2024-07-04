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
}

export const GET: RequestHandler = async () => {
  try {
    const leaderboardData = await kv.zrange('leaderboard', 0, 9, {
      withScores: true,
      rev: true
    });

    const leaderboard: LeaderboardEntry[] = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      leaderboard.push({
        playerName: leaderboardData[i] as string,
        score: Number(leaderboardData[i + 1])
      });
    }

    return new Response(JSON.stringify(leaderboard), {
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