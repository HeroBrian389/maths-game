<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { FractionQuestion } from '$lib/Game';
	import { CaretDown, CaretUp } from 'phosphor-svelte';
	import { onMount } from 'svelte';

	export let onAnswer: (numerator: number, denominator: number) => boolean;
	export let question: FractionQuestion;

	let numerator = '';
	let denominator = '';

	let focusedInput: 'numerator' | 'denominator' = 'numerator';
	let numeratorInput: HTMLInputElement;
	let denominatorInput: HTMLInputElement;

	const operationSymbols = {
		add: '+',
		subtract: '-',
		multiply: '×',
		divide: '÷'
	};

	function toggleFocus() {
		focusedInput = focusedInput === 'numerator' ? 'denominator' : 'numerator';
		if (focusedInput === 'numerator' && numeratorInput) {
			numeratorInput.focus();
		} else if (denominatorInput) {
			denominatorInput.focus();
		}
	}

	function checkAnswer() {
		if (numerator && denominator) {
			const userNumerator = parseInt(numerator);
			const userDenominator = parseInt(denominator);

            console.log(
                `User answer: ${userNumerator}/${userDenominator} | Correct answer: ${question.answerNum}/${question.answerDen}`
            )
            return onAnswer(userNumerator, userDenominator);
		}
        return false;
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			toggleFocus();
		}
	}

	onMount(() => {
		if (numeratorInput) {
			numeratorInput.focus();
		}
	});

	$: if (numerator && denominator) {
        if (checkAnswer()) {
            numerator = '';
            denominator = '';
        }
    }

	$: inputClass = 'w-32 text-center inline-block';
	$: focusClass = 'ring-2 ring-primary';
</script>

<div class="flex flex-col items-center space-y-4">
	<div class="flex items-center gap-x-6 text-2xl font-bold">
		<div class="flex flex-col gap-y-1">
			<span>{question.num1}</span>
			<span class="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
			<span>{question.den1}</span>
		</div>

		<span class="mx-2">{operationSymbols[question.operation]}</span>

		<div class="flex flex-col gap-y-1">
			<span>{question.num2}</span>
			<span class="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
			<span>{question.den2}</span>
		</div>

		<span class="mx-2">=</span>

		<div class="flex flex-col gap-y-1">
			<Input
				type="number"
				bind:value={numerator}
				on:focus={() => (focusedInput = 'numerator')}
				on:keydown={handleKeyPress}
				class={inputClass + (focusedInput === 'numerator' ? ' ' + focusClass : '')}
			>
				<input bind:this={numeratorInput} type="number" />
			</Input>
			<span class="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
			<Input
				bind:value={denominator}
				on:focus={() => (focusedInput = 'denominator')}
				on:keydown={handleKeyPress}
				class={inputClass + (focusedInput === 'denominator' ? ' ' + focusClass : '')}
			>
				<input bind:this={denominatorInput} type="number" />
			</Input>
		</div>

		<Button on:click={toggleFocus} size="icon" variant="ghost">
            {#if focusedInput === 'numerator'}
              <CaretDown size={16} />
            {:else}
              <CaretUp size={16} />
            {/if}
        </Button>
	</div>
</div>