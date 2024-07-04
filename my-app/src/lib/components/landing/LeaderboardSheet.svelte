<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { toast } from 'svelte-sonner';
    import { Ranking } from 'phosphor-svelte';
	import type { Selected } from 'bits-ui';

	interface LeaderboardEntry {
		playerName: string;
		score: number;
        date: string;
		gameMode: string;
	}

	let leaderboard: LeaderboardEntry[] = [];
	let isOpen = false;

	const gameModes: GameMode[] = [
		{
			label: 'All',
			value: 'all'
		},
		{
			label: 'Basic',
			value: 'basic'
		},
		{
			label: 'Advanced',
			value: 'advanced'
		},
		{
			label: 'Probability',
			value: 'probability'
		},
		{
			label: 'Large Numbers',
			value: 'largeNumbers'
		}
	]

	interface GameMode {
		label: string;
		value: string;
	}

	let selectedGameMode: Selected<string> = {
		label: 'All',
		value: 'all'
	}
	
	function formatDate(date: string) {
		const d = new Date(date);
		return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
	}

	async function fetchLeaderboard() {
		try {
			const response = await fetch(`/api/leaderboard?gameMode=${selectedGameMode.value}`);
			if (!response.ok) {
				throw new Error('Failed to fetch leaderboard');
			}
			leaderboard = await response.json();
			console.log('Leaderboard:', leaderboard);
		} catch (error) {
			console.error('Error fetching leaderboard:', error);
			toast.error('Failed to fetch leaderboard');
		}
	}

	function handleSheetOpenChange(value: boolean) {
		isOpen = value;
		if (isOpen) {
			fetchLeaderboard();
		}
	}

	function handleGameModeChange(value: Selected<string> | undefined) {
		if (!value) {
			console.error('Invalid game mode:', value);
			return;
		}

		const gameMode = gameModes.find(mode => mode.value === value.value);

		if (gameMode) {
			selectedGameMode = gameMode;
			fetchLeaderboard();
		} else {
			console.error('Invalid game mode:', value);
		}
	}

	onMount(fetchLeaderboard);
</script>

<Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
	<SheetTrigger>
		<Button variant="outline">
            <span class='md:block hidden'>
                View Leaderboard
            </span>
            <span class='md:hidden block'>
                <Ranking size={24} />
            </span>
        </Button>
	</SheetTrigger>
    
	<SheetContent>
		<SheetHeader>
            <SheetTitle>Leaderboard</SheetTitle>
            <SheetDescription>Top 10 players</SheetDescription>
        </SheetHeader>
		<div class="mt-4">
			<Select.Root selected={selectedGameMode} onSelectedChange={handleGameModeChange}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select Game Mode" />
				</Select.Trigger>
				<Select.Content>
					{#each gameModes as mode}
						<Select.Item value={mode.value} class="capitalize">{mode.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="mt-6">
			{#if leaderboard.length > 0}
				<ul>
					{#each leaderboard as entry, i}
						<li class="border-b py-2 last:border-b-0">
							<span class="font-bold">{i + 1}.</span>
							{entry.playerName}: {entry.score}
							<span class="text-sm text-gray-500">
								({entry.gameMode})
							</span>
							{#if entry.date}
								<span class="block text-sm text-gray-500">
									{formatDate(entry.date)}
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No entries for this game mode yet.</p>
			{/if}
		</div>
		<div class="mt-4">
			<Button on:click={fetchLeaderboard}>Refresh Leaderboard</Button>
		</div>
	</SheetContent>
</Sheet>