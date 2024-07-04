import type { GameMode, Question } from "$lib/GameMode";

export class ProbabilityGameMode implements GameMode {
  name = 'Probability';
  description = 'Practice probability calculations and estimations';

  generateQuestion(): Question {
    const questionTypes = ['percentage', 'partOfWhole', 'advancedArithmetic'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    switch (questionType) {
      case 'percentage':
        return this.generatePercentageQuestion();
      case 'partOfWhole':
        return this.generatePartOfWholeQuestion();
      case 'advancedArithmetic':
        return this.generateAdvancedArithmeticQuestion();
      default:
        throw new Error('Invalid question type');
    }
  }

  private generatePercentageQuestion(): Question {
    const percentage = Math.floor(Math.random() * 100) + 1; // 1 to 100
    const total = Math.floor(Math.random() * 998) + 3; // 3 to 1000
    const part = Math.round((percentage / 100) * total);

    return {
      text: `What is ${percentage}% of ${total}?`,
      correctAnswer: part
    };
  }

  private generatePartOfWholeQuestion(): Question {
    const part = Math.floor(Math.random() * 28) + 3; // 3 to 30
    const total = part + Math.floor(Math.random() * 10) + 1; // part + 1 to 10
    const percentage = Math.round((part / total) * 100);

    return {
      text: `${part} girls in a class of ${total}. What percentage are girls?`,
      correctAnswer: percentage
    };
  }

  private generateAdvancedArithmeticQuestion(): Question {
    const a = Math.floor(Math.random() * 999) + 2; // 2 to 1000
    const b = Math.floor(Math.random() * 999) + 2; // 2 to 1000
    const operation = Math.random() < 0.5 ? '+' : '-';
    const question = `${a} ${operation} ${b} = ?`;
    const answer = operation === '+' ? a + b : a - b;

    return { text: question, correctAnswer: answer };
  }

  checkAnswer(userAnswer: string, correctAnswer: number | string): boolean {
    return parseInt(userAnswer) === correctAnswer;
  }
}
