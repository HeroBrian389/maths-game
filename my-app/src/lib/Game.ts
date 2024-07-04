
  // Game.ts
  import type { GameMode } from './GameMode';
  import { GameModeFactory } from './GameModeFactory';
  
  export class Game {
    private gameMode: GameMode;
    private currentQuestion: string = '';
    private correctAnswer: number | string = '';
    public score: number = 0;
  
    constructor(mode: string) {
      this.gameMode = GameModeFactory.createGameMode(mode);
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
        this.score++;
      }
      return isCorrect;
    }
  
    getScore(): number {
      return this.score;
    }
  
    getGameModeName(): string {
      return this.gameMode.name;
    }
  
    getGameModeDescription(): string {
      return this.gameMode.description;
    }
  }