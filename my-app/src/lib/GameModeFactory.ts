import type { GameMode } from "./GameMode";
import { AdvancedGameMode } from "./modes/AdvancedGameMode";
import { BasicGameMode } from "./modes/BasicGameMode";
import { MediumGameMode } from "./modes/MediumGameMode";
import { LargeNumbersGameMode } from "./modes/LargeNumbersGameMode";
import { ProbabilityGameMode } from "./modes/ProbabilityGameMode";

export class GameModeFactory {
  static createGameMode(mode: string): GameMode {
    switch (mode) {
      case 'basic':
        return new BasicGameMode();
      case 'fractions':
        return new MediumGameMode();
      case 'advanced':
        return new AdvancedGameMode();
      case 'probability':
        return new ProbabilityGameMode();
      case 'largeNumbers':
        return new LargeNumbersGameMode();
      default:
        throw new Error(`Unknown game mode: ${mode}`);
    }
  }
}