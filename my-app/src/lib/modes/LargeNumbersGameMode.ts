import type { GameMode, Question } from "$lib/GameMode";


export class LargeNumbersGameMode implements GameMode {
  name = 'Large Numbers';
  description = 'Practice multiplication and division with very large numbers';

  generateQuestion(): Question {
    const operations = ['multiply', 'divide'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a: number, b: number, question: string, answer: number;

    switch (operation) {
      case 'multiply':
        a = Math.floor(Math.random() * 900000) + 100000; // 100,000 to 999,999
        b = Math.floor(Math.random() * 98) + 3; // 3 to 100
        question = `${this.formatLargeNumber(a)} × ${b} = ?`;
        answer = a * b;
        break;
      case 'divide':
        b = Math.floor(Math.random() * 98) + 3; // 3 to 100
        answer = Math.floor(Math.random() * 900000) + 100000; // 100,000 to 999,999
        a = answer * b;
        question = `${this.formatLargeNumber(a)} ÷ ${b} = ?`;
        break;
      default:
        throw new Error('Invalid operation');
    }

    return { text: question, correctAnswer: answer };
  }

  checkAnswer(userAnswer: string, correctAnswer: number | string): boolean {
    return parseInt(userAnswer) === correctAnswer;
  }

  private formatLargeNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

