<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import WelcomeCard from '$lib/components/landing/WelcomeCard.svelte';
	import LeaderboardSheet from '$lib/components/landing/LeaderboardSheet.svelte';

  enum GameState {
    Welcome,
    NameEntry,
    Ready,
    Playing,
    EndScreen
  }

  let gameState: GameState = GameState.Welcome;
  let playerName = '';
  let currentQuestion = '';
  let correctAnswer: number | string;
  let userAnswer = '';
  let score = 0;
  let timeLimit = 120;
  let timeLeft = timeLimit;
  let timerInterval: NodeJS.Timeout | undefined;
  let playerRank: number | null = null;


  function handleWelcomeContinue() {
    gameState = GameState.NameEntry;
  }

  function handleNameSubmit() {
    if (playerName.trim()) {
      gameState = GameState.Ready;
    } else {
      toast.error('Please enter your name');
    }
  }

  function startGame() {
    gameState = GameState.Playing;
    score = 0;
    timeLeft = timeLimit;
    generateQuestion();
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }


  function generateQuestion() {
    const operations = ['add', 'subtract', 'multiply', 'divide', 'probability'] as const;
    type Operation = (typeof operations)[number];
    
    // Adjust probability distribution
    const rand = Math.random();
    let operation: Operation;
    if (rand < 0.25) {
        operation = 'add';
    } else if (rand < 0.50) {
        operation = 'subtract';
    } else if (rand < 0.70) {
        operation = 'multiply';
    } else if (rand < 0.90) {
        operation = 'divide';
    } else {
        operation = 'probability';
    }

    switch (operation) {
        case 'add':
            const a = Math.floor(Math.random() * 1000);
            const b = Math.floor(Math.random() * 1000);
            const c = Math.random() < 0.3 ? Math.floor(Math.random() * 1000) : 0;
            if (c > 0) {
                currentQuestion = `${a} + ${b} + ${c} = ?`;
                correctAnswer = a + b + c;
            } else {
                currentQuestion = `${a} + ${b} = ?`;
                correctAnswer = a + b;
            }
            break;
        case 'subtract':
            const d = Math.floor(Math.random() * 1000);
            const e = Math.floor(Math.random() * d);
            const f = Math.random() < 0.3 ? Math.floor(Math.random() * e) : 0;
            if (f > 0) {
                currentQuestion = `${d} - ${e} - ${f} = ?`;
                correctAnswer = d - e - f;
            } else {
                currentQuestion = `${d} - ${e} = ?`;
                correctAnswer = d - e;
            }
            break;
        case 'multiply':
            const g = Math.floor(Math.random() * 100) + 1;
            const h = Math.floor(Math.random() * 100) + 1;
            currentQuestion = `${g} × ${h} = ?`;
            correctAnswer = g * h;
            break;
        case 'divide':
            const denominator = Math.floor(Math.random() * 99) + 1;
            const quotient = Math.floor(Math.random() * 100) + 1;
            const numerator = denominator * quotient;
            currentQuestion = `${numerator} ÷ ${denominator} = ?`;
            correctAnswer = quotient;
            break;
        case 'probability':
            const total = Math.floor(Math.random() * 100) + 10;
            const subset = Math.floor(Math.random() * total) + 1;
            const probabilityType = Math.random() < 0.5 ? 'percentage' : 'fraction';
            if (probabilityType === 'percentage') {
                currentQuestion = `What is the probability of selecting ${subset} item(s) out of ${total}? (Answer as a percentage)`;
                correctAnswer = Math.round((subset / total) * 100);
            } else {
                currentQuestion = `What is the probability of selecting ${subset} item(s) out of ${total}? (Answer as a simplified fraction)`;
                correctAnswer = `${subset}/${total}`;
            }
            break;
    }
}

  
  function checkAnswer() {
    if (parseInt(userAnswer) === correctAnswer) {
      score++;
      userAnswer = '';
      generateQuestion();
    }
  }

  async function endGame() {
    if (timerInterval) clearInterval(timerInterval);
    await saveScore();
    gameState = GameState.EndScreen;
  }

  
async function saveScore() {
  try {
    const response = await fetch('?/saveScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerName,
        score,
        date: new Date().toISOString()
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save score');
    }

    playerRank = result.rank;
    toast.success('Score saved successfully!');
  } catch (error) {
    console.error('Error saving score:', error);
    toast.error('Failed to save score. Please try again.');
  }
}

  function returnToReady() {
    gameState = GameState.Ready;
  }

  $: if (userAnswer) {
    checkAnswer();
  }
</script>




<Toaster />
<main class="container mx-auto p-4 max-w-4xl relative">
  <div class="absolute top-4 right-4">
    <LeaderboardSheet />
  </div>

  {#if gameState === GameState.Welcome}
    <WelcomeCard on:continue={handleWelcomeContinue} />
  {:else if gameState === GameState.NameEntry}
    <div class="max-w-lg mx-auto">
      <h2 class="text-2xl font-bold mb-4">Enter Your Name</h2>
      <Input 
        type="text" 
        placeholder="Your name" 
        bind:value={playerName} 
        class="mb-4"
      />
      <Button on:click={handleNameSubmit}>Continue</Button>
    </div>
  {:else if gameState === GameState.Ready}
    <div class="max-w-lg mx-auto">
      <h2 class="text-2xl font-bold mb-4">Ready to Play, {playerName}?</h2>
      <Button on:click={startGame}>Start Game</Button>
    </div>
  {:else if gameState === GameState.Playing}
    <div class="max-w-lg mx-auto">
      <h2 class="text-xl font-semibold mb-4">{currentQuestion}</h2>
      <Input 
        type="number" 
        placeholder="Your answer" 
        bind:value={userAnswer}
        class="mb-4"
      />
      <div class="flex justify-between mb-2">
        <span>Score: {score}</span>
        <span>Time Left: {timeLeft}s</span>
      </div>
      <Progress value={timeLeft} max={timeLimit} class="w-full" />
    </div>
  {:else if gameState === GameState.EndScreen}
    <div class="max-w-lg mx-auto bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4">Game Over, {playerName}!</h2>
      <p class="text-3xl font-semibold mb-4">Your score: {score}</p>
      {#if playerRank !== null}
        <p class="text-xl mb-4">Your rank: {playerRank}</p>
      {/if}
      <Button on:click={returnToReady}>Back to Start</Button>
    </div>
  {/if}
</main>