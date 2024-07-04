<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	export let mode: string;
	export let title: string;
	export let description: string;
	export let onSelect: () => void;
</script>

<Card class="h-full flex flex-col">
	<CardHeader>
		<CardTitle>{title}</CardTitle>
		<CardDescription>{mode}</CardDescription>
	</CardHeader>
	<CardContent>
		<p>{description}</p>
	</CardContent>
	<CardFooter class="mt-auto">
		<Button on:click={onSelect} class="w-full">Select</Button>
	</CardFooter>
</Card>