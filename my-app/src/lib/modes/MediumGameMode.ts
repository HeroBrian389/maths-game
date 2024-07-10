import type { GameMode, Question } from "$lib/GameMode";

interface FractionQuestion extends Question {
    operation: string;
    num1: number;
    den1: number;
    num2: number;
    den2: number;
    answerNum: number;
    answerDen: number;
  }
  
  export class MediumGameMode implements GameMode {
    name = 'Medium';
    description = 'Practice arithmetic operations with smaller numbers and fractions';
  
    generateQuestion(): Question | FractionQuestion {
      const operations = ['add', 'subtract', 'multiply', 'divide', 'fraction'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
  
      if (operation === 'fraction') {
        return this.generateFractionQuestion();
      } else {
        return this.generateBasicQuestion(operation);
      }
    }

  private generateBasicQuestion(operation: string): Question {
    let a: number, b: number, question: string, answer: number;

    switch (operation) {
      case 'add':
        a = Math.floor(Math.random() * 99) + 2;
        b = Math.floor(Math.random() * 99) + 2;
        question = `${a} + ${b} = ?`;
        answer = a + b;
        break;
      case 'subtract':
        a = Math.floor(Math.random() * 99) + 2;
        b = Math.floor(Math.random() * 99) + 2;
        question = `${a + b} - ${a} = ?`;
        answer = b;
        break;
      case 'multiply':
        a = Math.floor(Math.random() * 11) + 2;
        b = Math.floor(Math.random() * 99) + 2;
        question = `${a} × ${b} = ?`;
        answer = a * b;
        break;
      case 'divide':
        a = Math.floor(Math.random() * 11) + 2;
        b = Math.floor(Math.random() * 99) + 2;
        question = `${a * b} ÷ ${a} = ?`;
        answer = b;
        break;
      default:
        throw new Error('Invalid operation');
    }

    return { text: question, correctAnswer: answer };
  }
  private generateFractionQuestion(): FractionQuestion {
    const operations = ['add', 'subtract', 'multiply', 'divide'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, den1: number, num2: number, den2: number, answerNum: number, answerDen: number;

    num1 = Math.floor(Math.random() * 9) + 1;
    den1 = Math.floor(Math.random() * 9) + 1;
    num2 = Math.floor(Math.random() * 9) + 1;
    den2 = Math.floor(Math.random() * 9) + 1;

    switch (operation) {
      case 'add':
        answerNum = num1 * den2 + num2 * den1;
        answerDen = den1 * den2;
        break;
      case 'subtract':
        answerNum = num1 * den2 - num2 * den1;
        answerDen = den1 * den2;
        break;
      case 'multiply':
        answerNum = num1 * num2;
        answerDen = den1 * den2;
        break;
      case 'divide':
        answerNum = num1 * den2;
        answerDen = den1 * num2;
        break;
      default:
        throw new Error('Invalid operation');
    }

    [answerNum, answerDen] = this.simplifyFraction(answerNum, answerDen);

    const operationSymbol = {
      'add': '+',
      'subtract': '-',
      'multiply': '×',
      'divide': '÷'
    }[operation];

    const text = `${num1}/${den1} ${operationSymbol} ${num2}/${den2} = ?`;

    return { 
      text, 
      operation, 
      num1, 
      den1, 
      num2, 
      den2, 
      answerNum, 
      answerDen,
      correctAnswer: `${answerNum}/${answerDen}`
    };
  }

  private simplifyFraction(numerator: number, denominator: number): [number, number] {
    const gcd = this.getGCD(Math.abs(numerator), Math.abs(denominator));
    return [numerator / gcd, denominator / gcd];
  }

  private getGCD(a: number, b: number): number {
    return b === 0 ? a : this.getGCD(b, a % b);
  }

  checkAnswer(userAnswer: string, correctAnswer: number | string): boolean {
    if (typeof correctAnswer === 'number') {
      return parseInt(userAnswer) === correctAnswer;
    } else {
      const [userNum, userDen] = userAnswer.split('/').map(Number);
      const [correctNum, correctDen] = correctAnswer.split('/').map(Number);
      const [simplifiedUserNum, simplifiedUserDen] = this.simplifyFraction(userNum, userDen);
      const [simplifiedCorrectNum, simplifiedCorrectDen] = this.simplifyFraction(correctNum, correctDen);
      return simplifiedUserNum === simplifiedCorrectNum && simplifiedUserDen === simplifiedCorrectDen;
    }
  }
}

