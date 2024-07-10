<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import WelcomeCard from '$lib/components/landing/WelcomeCard.svelte';
	import LeaderboardSheet from '$lib/components/landing/LeaderboardSheet.svelte';
	import { Game, type FractionQuestion } from '$lib/Game';
	import ModeSelectionCard from '$lib/components/landing/ModeSelectionCard.svelte';
	import FractionInput from '$lib/components/landing/FractionInput.svelte';
	import type { Question } from '$lib/GameMode';


	enum GameState {
		Welcome,
		NameEntry,
		ModeSelection,
		Ready,
		Playing,
		EndScreen
	}

	let gameState: GameState = GameState.Welcome;
	let playerName = '';
	let selectedMode = '';
	let game: Game;
	let currentQuestion: Question | FractionQuestion;
	let userAnswer = '';
	let timeLimit = 120;
	let timeLeft = timeLimit;
	let timerInterval: NodeJS.Timeout | undefined;
	let playerRank: number | null = null;

	const gameModes = [
		{
			mode: 'basic',
			title: 'Basic Mode',
			description: 'Practice with numbers up to 100. Ideal for beginners.'
		},
		{
			mode: 'fractions',
			title: 'Fractions mode',
			description: 'The same as basic but with fractions.'
		}
	];

	function handleWelcomeContinue() {
		gameState = GameState.NameEntry;
	}

	function handleNameSubmit() {
		if (playerName.trim()) {
			gameState = GameState.ModeSelection;
		} else {
			toast.error('Please enter your name');
		}
	}

	function handleModeSelection(mode: string) {
		selectedMode = mode;
		if (!game) {
			game = new Game(mode);
		} else {
			game.reset(mode);
		}
		gameState = GameState.Ready;
	}



	function startGame() {
		gameState = GameState.Playing;
		timeLeft = timeLimit;
		game.reset(selectedMode);
		generateQuestion();
		startTimer();
	}

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) endGame();
		}, 1000);
	}

	

	function generateQuestion() {
		currentQuestion = game.generateQuestion();
	}

	function checkAnswer(numerator?: number, denominator?: number): boolean {
		let answer: string | { numerator: number; denominator: number };
		if (numerator !== undefined && denominator !== undefined) {
			answer = { numerator, denominator };
		} else {
			answer = userAnswer;
		}

		if (game.checkAnswer(answer)) {
			userAnswer = '';
			generateQuestion();
			return true;
		} 
		return false;
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
			formData.append('score', game.getScore().toString());
			formData.append('gameMode', selectedMode);
			formData.append('date', new Date().toISOString());

			const response = await fetch('?/saveScore', {
				method: 'POST',
				body: formData
			});

			console.log(response);

			const result = await response.json();

			const dataResponse = JSON.parse(result.data);

			if (dataResponse.error) {
				throw new Error(dataResponse.error);
			}

			// Check if the result is an array and get the first element
			const data = Array.isArray(dataResponse) ? dataResponse[0] : dataResponse;

			if (!data.success) {
				throw new Error(data.message);
			}

			playerRank = data.rank;
			toast.success('Score saved successfully!');
		} catch (error) {
			console.error('Error saving score:', error);
			toast.error('Failed to save score. Please try again.');
		}
	}

	function returnToModeSelection() {
		gameState = GameState.ModeSelection;
	}

	$: if (userAnswer) {
		checkAnswer();
	}

	let score: number;
	$: if (game) {
		game.score.subscribe(value => {
			score = value;
		});
	}
</script>

<Toaster />
<div class="absolute right-4 top-4 z-50">
	<LeaderboardSheet />
</div>
<main class="container relative mx-auto mt-12 max-w-4xl p-4 sm:mt-6">
	{#if gameState === GameState.Welcome}
		<WelcomeCard {timeLimit} on:continue={handleWelcomeContinue} />
	{:else if gameState === GameState.NameEntry}
		<div class="mx-auto max-w-lg">
			<h2 class="mb-4 text-2xl font-bold">Enter Your Name</h2>
			<Input type="text" placeholder="Your name" bind:value={playerName} class="mb-4" />
			<Button on:click={handleNameSubmit}>Continue</Button>
		</div>
	{:else if gameState === GameState.ModeSelection}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each gameModes as { mode, title, description }}
				<ModeSelectionCard
					{mode}
					{title}
					{description}
					onSelect={() => handleModeSelection(mode)}
				/>
			{/each}
		</div>
	{:else if gameState === GameState.Ready}
		<div class="mx-auto max-w-lg">
			<h2 class="mb-4 text-2xl font-bold">Ready to Play, {playerName}?</h2>
			<p class="mb-4">Mode: {game.getGameModeName()}</p>
			<p class="mb-4">{game.getGameModeDescription()}</p>
			<Button on:click={startGame}>Start Game</Button>
		</div>
	{:else if gameState === GameState.Playing}
		<div class="mx-auto max-w-lg">
			{#if 'operation' in currentQuestion}
				<FractionInput question={currentQuestion} onAnswer={checkAnswer} />
			{:else}
				<h2 class="mb-4 text-xl font-semibold">{currentQuestion.text}</h2>
				<Input type="number" pattern="[0-9]*" placeholder="Your answer" bind:value={userAnswer} class="mb-4" />
				<Button on:click={() => checkAnswer()}>Submit</Button>
			{/if}
			<div class="mb-2 flex justify-between">
				<span>Score: {score}</span>
				<span>Time Left: {timeLeft}s</span>
			</div>
			<Progress value={timeLeft} max={timeLimit} class="w-full" />
		</div>
	{:else if gameState === GameState.EndScreen}
		<div class="mx-auto max-w-lg rounded-lg bg-gray-50 p-6 shadow-md dark:bg-zinc-900">
			<h2 class="mb-4 text-2xl font-bold">Game Over, {playerName}!</h2>
			<p class="mb-4 text-3xl font-semibold">Your score: {game.getScore()}</p>
			<p class="mb-4">Mode: {game.getGameModeName()}</p>
			{#if playerRank !== null}
				<p class="mb-4 text-xl">Your rank: {playerRank}</p>
			{/if}
			<Button on:click={returnToModeSelection} class="mr-2">Change Mode</Button>
			<Button on:click={startGame} class="mr-2">Play Again</Button>
			<Button on:click={() => (gameState = GameState.Welcome)} variant="outline"
				>Back to Welcome</Button
			>
		</div>
	{/if}
</main>
