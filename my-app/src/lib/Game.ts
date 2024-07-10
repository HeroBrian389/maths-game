import type { GameMode, Question } from './GameMode';
import { GameModeFactory } from './GameModeFactory';
import { writable, type Writable } from 'svelte/store';


export interface FractionQuestion extends Question {
  operation: string;
  num1: number;
  den1: number;
  num2: number;
  den2: number;
  answerNum: number;
  answerDen: number;
}

export class Game {
  private gameMode: GameMode;
  private currentQuestion: Question | FractionQuestion;
  public score: Writable<number>;

  constructor(mode: string) {
    this.gameMode = GameModeFactory.createGameMode(mode);
    this.score = writable(0);
    this.currentQuestion = { text: '', correctAnswer: '' };
  }

  generateQuestion(): Question | FractionQuestion {
    this.currentQuestion = this.gameMode.generateQuestion();
    return this.currentQuestion;
  }

  checkAnswer(userAnswer: string | { numerator: number; denominator: number }): boolean {
    let isCorrect: boolean;

    if (typeof userAnswer === 'string') {
      isCorrect = this.gameMode.checkAnswer(userAnswer, this.currentQuestion.correctAnswer);
    } else {
      const fractionAnswer = `${userAnswer.numerator}/${userAnswer.denominator}`;
      isCorrect = this.gameMode.checkAnswer(fractionAnswer, this.currentQuestion.correctAnswer);
    }

    if (isCorrect) {
      this.score.update(n => n + 1);
    }
    return isCorrect;
  }

  getCurrentQuestion(): Question | FractionQuestion {
    return this.currentQuestion;
  }


  getScore(): number {
    let currentScore: number = 0;
    const unsubscribe = this.score.subscribe(value => {
      currentScore = value;
    });
    unsubscribe();
    return currentScore;
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
    this.currentQuestion = { text: '', correctAnswer: '' };
  }
}