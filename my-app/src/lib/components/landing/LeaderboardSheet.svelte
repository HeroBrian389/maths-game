<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { toast } from 'svelte-sonner';
    import { Ranking } from 'phosphor-svelte'

	interface LeaderboardEntry {
		playerName: string;
		score: number;
        date: string;
	}

	let leaderboard: LeaderboardEntry[] = [];
	let isOpen = false;

	function formatDate(date: string) {
		// date is in format "2021-09-30T00:00:00.000Z" e.g. 2024-07-04T13:10:04.722Z
		const d = new Date(date);

		// return it like "4th July 2024"
		return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
	}

	async function fetchLeaderboard() {
		try {
			const response = await fetch('/api/leaderboard');
			if (!response.ok) {
				throw new Error('Failed to fetch leaderboard');
			}
			leaderboard = await response.json();
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

	onMount(fetchLeaderboard);
</script>

<Sheet onOpenChange={handleSheetOpenChange}>
	<SheetTrigger>
		<Button variant="outline">
            <span class='md:block hidden'>
                View Leaderboard
            </span>
            <span class='md:hidden block'>
                <Ranking size={24} />
        </Button>
	</SheetTrigger>
    
	<SheetContent>
		<SheetHeader>
            <SheetTitle>Leaderboard</SheetTitle>
            <SheetDescription>Top 10 players</SheetDescription>
        </SheetHeader>
		<div class="mt-6">
			{#if leaderboard.length > 0}
				<ul>
					{#each leaderboard as entry, i}
						<li class="border-b py-2 last:border-b-0">
							<span class="font-bold">{i + 1}.</span>
							{entry.playerName}: {entry.score}
							{#if entry.date}
								<span class="text-sm text-gray-500"> - {formatDate(entry.date)}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No entries yet.</p>
			{/if}
		</div>
		<div class="mt-4">
			<Button on:click={fetchLeaderboard}>Refresh Leaderboard</Button>
		</div>
	</SheetContent>
</Sheet>
