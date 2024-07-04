<script lang="ts">
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Progress } from "$lib/components/ui/progress";
    import type { PageData } from './$types';
  
    export let data: PageData;
  
    let playerName = '';
    let gameStarted = false;
    let currentQuestion = '';
    let correctAnswer: number;
    let userAnswer = '';
    let score = 0;
    let timeLeft = 60;
    let timerInterval: NodeJS.Timeout | undefined;
  
    function startGame() {
      if (playerName.trim() === '') return;
      gameStarted = true;
      score = 0;
      timeLeft = 60;
      generateQuestion();
      timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
  
    function generateQuestion() {
      const operations = ['add', 'subtract', 'multiply', 'divide', 'probability'] as const;
      type Operation = typeof operations[number];
      const operation: Operation = operations[Math.floor(Math.random() * operations.length)];
  
      switch (operation) {
        case 'add':
          const a = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100);
          currentQuestion = `${a} + ${b} = ?`;
          correctAnswer = a + b;
          break;
        case 'subtract':
          const c = Math.floor(Math.random() * 100);
          const d = Math.floor(Math.random() * c);
          currentQuestion = `${c} - ${d} = ?`;
          correctAnswer = c - d;
          break;
        case 'multiply':
          const e = Math.floor(Math.random() * 12) + 1;
          const f = Math.floor(Math.random() * 12) + 1;
          currentQuestion = `${e} × ${f} = ?`;
          correctAnswer = e * f;
          break;
        case 'divide':
          const g = Math.floor(Math.random() * 12) + 1;
          const h = Math.floor(Math.random() * 12) + 1;
          const product = g * h;
          currentQuestion = `${product} ÷ ${g} = ?`;
          correctAnswer = h;
          break;
        case 'probability':
          const total = Math.floor(Math.random() * 50) + 10;
          const subset = Math.floor(Math.random() * total) + 1;
          currentQuestion = `What is the probability of selecting ${subset} item(s) out of ${total}? (Answer as a percentage)`;
          correctAnswer = Math.round((subset / total) * 100);
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
  
    function endGame() {
      if (timerInterval) clearInterval(timerInterval);
      gameStarted = false;
    }
  
    $: if (userAnswer) {
      checkAnswer();
    }
  </script>
  
  <main class="container mx-auto p-4 max-w-lg">
    {#if !gameStarted}
      <h1 class="text-2xl font-bold mb-4">Mental Math Game</h1>
      <Input 
        type="text" 
        placeholder="Enter your name" 
        bind:value={playerName} 
        class="mb-4"
      />
      <Button on:click={startGame}>Start Game</Button>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Leaderboard</h2>
      <ul>
        {#each data.leaderboard as entry, i}
          <li>{i + 1}. {entry.playerName}: {entry.score}</li>
        {/each}
      </ul>
    {:else if gameStarted}
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
      <Progress value={timeLeft} max={60} class="w-full" />
    {:else}
      <h2 class="text-xl font-semibold mb-4">Game Over!</h2>
      <p>Your score: {score}</p>
      <form method="POST" action="?/saveScore" use:enhance>
        <input type="hidden" name="playerName" value={playerName} />
        <input type="hidden" name="score" value={score} />
        <Button type="submit" class="mt-4">Save Score</Button>
      </form>
      <Button on:click={() => { playerName = ''; gameStarted = false; }} class="mt-4">Play Again</Button>
    {/if}
  </main>