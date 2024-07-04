import type { GameMode, Question } from "$lib/GameMode";

export class AdvancedGameMode implements GameMode {
  name = 'Advanced';
  description = 'Practice advanced arithmetic operations with larger numbers';

  generateQuestion(): Question {
    const operations = ['add', 'subtract', 'multiply', 'divide'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a: number, b: number, question: string, answer: number;

    switch (operation) {
      case 'add':
        a = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        b = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        question = `${a} + ${b} = ?`;
        answer = a + b;
        break;
      case 'subtract':
        a = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        b = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        question = `${a + b} - ${a} = ?`;
        answer = b;
        break;
      case 'multiply':
        a = Math.floor(Math.random() * 99) + 2; // 2 to 100
        b = Math.floor(Math.random() * 99) + 2; // 2 to 100
        question = `${a} × ${b} = ?`;
        answer = a * b;
        break;
      case 'divide':
        a = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        b = Math.floor(Math.random() * 999) + 2; // 2 to 1000
        question = `${a * b} ÷ ${a} = ?`;
        answer = b;
        break;
      default:
        throw new Error('Invalid operation');
    }

    return { text: question, correctAnswer: answer };
  }

  checkAnswer(userAnswer: string, correctAnswer: number | string): boolean {
    return parseInt(userAnswer) === correctAnswer;
  }
}
