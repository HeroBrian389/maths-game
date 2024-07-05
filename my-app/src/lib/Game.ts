import type { GameMode } from './GameMode';
import { GameModeFactory } from './GameModeFactory';
import { writable, type Writable } from 'svelte/store';

export class Game {
  private gameMode: GameMode;
  private currentQuestion: string = '';
  private correctAnswer: number | string = '';
  public score: Writable<number>;

  constructor(mode: string) {
    this.gameMode = GameModeFactory.createGameMode(mode);
    this.score = writable(0);
  }

  generateQuestion() {
    const question = this.gameMode.generateQuestion();
    this.currentQuestion = question.text;
    this.correctAnswer = question.correctAnswer;
    return this.currentQuestion;
  }

  checkAnswer(userAnswer: string): boolean {
    const isCorrect = this.gameMode.checkAnswer(userAnswer, this.correctAnswer);
    if (isCorrect) {
      this.score.update(n => n + 1);
    }
    return isCorrect;
  }

  getScore(): number {
    let currentScore;
    this.score.subscribe(value => {
      currentScore = value;
    })();
    return currentScore!;
  }

  resetScore() {
    this.score.set(0);
  }

  getGameModeName(): string {
    return this.gameMode.name;
  }

  getGameModeDescription(): string {
    return this.gameMode.description;
  }

  reset(mode?: string) {
    if (mode) {
      this.gameMode = GameModeFactory.createGameMode(mode);
    }
    this.resetScore();
    this.currentQuestion = '';
    this.correctAnswer = '';
  }
}