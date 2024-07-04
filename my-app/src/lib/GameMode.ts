// GameMode.ts
export interface Question {
    text: string;
    correctAnswer: number | string;
  }
  
  export interface GameMode {
    name: string;
    description: string;
    generateQuestion(): Question;
    checkAnswer(userAnswer: string, correctAnswer: number | string): boolean;
  }