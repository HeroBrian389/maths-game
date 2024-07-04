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
  gameMode: string;
  date: string;
}

export const load = async () => {
  const leaderboardData = await kv.zrange('leaderboard', 0, 9, {
    withScores: true,
    rev: true
  });

  const leaderboard: LeaderboardEntry[] = [];
  for (let i = 0; i < leaderboardData.length; i += 2) {
    const [playerName, score, gameMode, date] = (leaderboardData[i] as string).split('|');
    leaderboard.push({
      playerName,
      score: Number(score),
      gameMode,
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
    const gameMode = formData.get('gameMode');
    const date = formData.get('date') || new Date().toISOString();

    if (typeof playerName !== 'string' || isNaN(score) || typeof gameMode !== 'string' || typeof date !== 'string') {
      return { success: false, error: 'Invalid input' };
    }

    try {
      const member = `${playerName}|${score}|${gameMode}|${date}`;

      // save member in leaderboard
      await kv.zadd('leaderboard', { score: score, member: member });
      await kv.zadd(`leaderboard:${gameMode}`, { score: score, member: member });

      // Get all scores higher than or equal to the current score for this game mode
      const higherScores = await kv.zcount(`leaderboard:${gameMode}`, score, '+inf');

      console.log(`New score for ${playerName} in ${gameMode}: ${score} (rank ${higherScores + 1})`);

      // The rank is the number of higher scores + 1
      const rank = higherScores;

      return { success: true, rank };
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