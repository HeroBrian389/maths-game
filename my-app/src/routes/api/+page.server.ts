import { kv } from '@vercel/kv';
import type { PageServerLoad } from './$types';

import type { Actions } from '@sveltejs/kit';

interface LeaderboardEntry {
  playerName: string;
  score: number;
}

export const load: PageServerLoad = async () => {
  const leaderboardData = await kv.zrange('leaderboard', 0, 9, {
    withScores: true,
    rev: true
  });

  const leaderboard: LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
    playerName: entry.member as string,
    score: entry.score as number
  }));

  return { leaderboard };
};

export const actions: Actions = {
  saveScore: async ({ request }) => {
    const data = await request.formData();
    const playerName = data.get('playerName') as string;
    const score = parseInt(data.get('score') as string);

    if (!playerName || isNaN(score)) {
      return { success: false, error: 'Invalid data' };
    }

    await kv.zadd('leaderboard', { score: score, member: playerName });

    return { success: true };
  }
};