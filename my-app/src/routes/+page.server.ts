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
    const formData = await request.formData();
    const playerName = formData.get('playerName');
    const score = Number(formData.get('score'));
    const date = formData.get('date') || new Date().toISOString();

    if (typeof playerName !== 'string' || isNaN(score) || typeof date !== 'string') {
      return { success: false, error: 'Invalid input' };
    }

    try {
      const member = `${playerName}|${score}|${date}`;

      await kv.zadd('leaderboard', { score, member });

      const rank = await kv.zrevrank('leaderboard', member);

      const totalEntries = await kv.zcard('leaderboard');

      if (rank === null || rank >= 10) {
        return { 
          success: true, 
          rank: rank !== null ? rank + 1 : totalEntries, 
          message: "Score saved, but not in the top 10."
        };
      }

      return { success: true, rank: rank + 1 };
    } catch (error) {
      console.error('Detailed error in saveScore:', error);
      if (error instanceof Error) {
        return { success: false, error: `Failed to save score: ${error.message}` };
      } else {
        return { success: false, error: 'Failed to save score: Unknown error' };
      }
    }
  }
};