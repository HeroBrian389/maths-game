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
		} else if (rand < 0.5) {
			operation = 'subtract';
		} else if (rand < 0.7) {
			operation = 'multiply';
		} else if (rand < 0.9) {
			operation = 'divide';
		} else {
			operation = 'probability';
		}

		switch (operation) {
			case 'add':
				const a = Math.floor(Math.random() * 99) + 2; // 2 to 100
				const b = Math.floor(Math.random() * 99) + 2; // 2 to 100
				currentQuestion = `${a} + ${b} = ?`;
				correctAnswer = a + b;
				break;
			case 'subtract':
				const c = Math.floor(Math.random() * 99) + 2; // 2 to 100
				const d = Math.floor(Math.random() * 99) + 2; // 2 to 100
				const sum = c + d;
				currentQuestion = `${sum} - ${c} = ?`;
				correctAnswer = d;
				break;
			case 'multiply':
				const e = Math.floor(Math.random() * 11) + 2; // 2 to 12
				const f = Math.floor(Math.random() * 99) + 2; // 2 to 100
				currentQuestion = `${e} × ${f} = ?`;
				correctAnswer = e * f;
				break;
			case 'divide':
				const g = Math.floor(Math.random() * 11) + 2; // 2 to 12
				const h = Math.floor(Math.random() * 99) + 2; // 2 to 100
				const product = g * h;
				currentQuestion = `${product} ÷ ${g} = ?`;
				correctAnswer = h;
				break;

			case 'probability':
				const total = Math.floor(Math.random() * 91) + 10; // 10 to 100
				let part: number;

				// Ensure we get a proper ratio (not all items and not just 1 item)
				do {
					part = Math.floor(Math.random() * (total - 1)) + 1;
				} while (part === 1 || part === total);

				const gcd = findGCD(part, total);
				const simplifiedPart = part / gcd;
				const simplifiedTotal = total / gcd;

				const questionType = Math.random() < 0.5 ? 'partToWhole' : 'wholeToPart';

				if (questionType === 'partToWhole') {
					currentQuestion = `If ${simplifiedPart} out of every ${simplifiedTotal} items are selected, what percentage does this represent?`;
					correctAnswer = Math.round((simplifiedPart / simplifiedTotal) * 100);
				} else {
					const percentage = Math.round((simplifiedPart / simplifiedTotal) * 100);
					currentQuestion = `If ${percentage}% of items are selected, what is this as a simplified ratio? (Enter the number of selected items, assuming the total is ${simplifiedTotal})`;
					correctAnswer = simplifiedPart;
				}
				break;
		}
	}

	// Helper function to find the Greatest Common Divisor (GCD)
	function findGCD(a: number, b: number): number {
		return b === 0 ? a : findGCD(b, a % b);
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
    const formData = new FormData();
    formData.append('playerName', playerName);
    formData.append('score', score);
    formData.append('date', new Date().toISOString());

    const response = await fetch('?/saveScore', {
      method: 'POST',
      body: formData
    });

	const result = await response.json();

	const dataResponse = JSON.parse(result.data)

	if (dataResponse.error) {
		throw new Error(dataResponse.error);
	}

    // Check if the result is an array and get the first element
    const data = Array.isArray(dataResponse) ? dataResponse[0] : dataResponse;

	if (!data.success) {
		throw new Error(data.message);
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
<div class="absolute right-4 top-4">
	<LeaderboardSheet />
</div>
<main class="container relative mx-auto mt-12 max-w-4xl p-4 sm:mt-6">
	{#if gameState === GameState.Welcome}
		<WelcomeCard on:continue={handleWelcomeContinue} />
	{:else if gameState === GameState.NameEntry}
		<div class="mx-auto max-w-lg">
			<h2 class="mb-4 text-2xl font-bold">Enter Your Name</h2>
			<Input type="text" placeholder="Your name" bind:value={playerName} class="mb-4" />
			<Button on:click={handleNameSubmit}>Continue</Button>
		</div>
	{:else if gameState === GameState.Ready}
		<div class="mx-auto max-w-lg">
			<h2 class="mb-4 text-2xl font-bold">Ready to Play, {playerName}?</h2>
			<Button on:click={startGame}>Start Game</Button>
		</div>
	{:else if gameState === GameState.Playing}
		<div class="mx-auto max-w-lg">
			<h2 class="mb-4 text-xl font-semibold">{currentQuestion}</h2>
			<Input type="number" placeholder="Your answer" bind:value={userAnswer} class="mb-4" />
			<div class="mb-2 flex justify-between">
				<span>Score: {score}</span>
				<span>Time Left: {timeLeft}s</span>
			</div>
			<Progress value={timeLeft} max={timeLimit} class="w-full" />
		</div>
	{:else if gameState === GameState.EndScreen}
		<div class="mx-auto max-w-lg rounded-lg bg-gray-50 p-6 shadow-md dark:bg-zinc-900">
			<h2 class="mb-4 text-2xl font-bold">Game Over, {playerName}!</h2>
			<p class="mb-4 text-3xl font-semibold">Your score: {score}</p>
			{#if playerRank !== null}
				<p class="mb-4 text-xl">Your rank: {playerRank}</p>
			{/if}
			<Button on:click={returnToReady}>Back to Start</Button>
		</div>
	{/if}
</main>
