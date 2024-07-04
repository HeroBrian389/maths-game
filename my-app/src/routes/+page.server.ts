import { createClient } from '@vercel/kv'
import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private'
import type { Actions } from './$types'

const kv = createClient({
	url: KV_REST_API_URL,
	token: KV_REST_API_TOKEN
})

interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
}

export const load = async () => {
  const leaderboardData = await kv.zrange('leaderboard', 0, 9, {
    withScores: true,
    rev: true
  });

  const leaderboard: LeaderboardEntry[] = [];
  for (let i = 0; i < leaderboardData.length; i += 2) {
    const [playerName, score, date] = (leaderboardData[i] as string).split('|');
    leaderboard.push({
      playerName,
      score: Number(score),
      date
    });
  }

  return { leaderboard };
};

export const actions: Actions = {
  saveScore: async ({ request }) => {
    const { playerName, score, date } = await request.json();

    if (typeof playerName !== 'string' || typeof score !== 'number' || typeof date !== 'string') {
      return { success: false, error: 'Invalid input' };
    }

    try {
      const member = `${playerName}|${score}|${date}`;
      await kv.zadd('leaderboard', { score, member });

      // Calculate player's rank
      const rank = await kv.zrevrank('leaderboard', member);
      
      return { success: true, rank: rank !== null ? rank + 1 : null };
    } catch (error) {
      console.error('Error saving score:', error);
      return { success: false, error: 'Failed to save score' };
    }
  }
};