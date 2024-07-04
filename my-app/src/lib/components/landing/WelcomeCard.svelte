<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";

  const dispatch = createEventDispatcher();

  function handleContinue() {
    dispatch('continue');
  }
</script>

<Card class="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Welcome to the Mental Math Game!</CardTitle>
    <CardDescription>Test your math skills under time pressure</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="mb-2">How to play:</p>
    <ul class="list-disc list-inside mb-4">
      <li>You have 60 seconds to answer as many questions as you can</li>
      <li>Questions include addition, subtraction, multiplication, division, and probability</li>
      <li>For probability questions, give the nearest whole number percentage (e.g., 0.33 becomes 33)</li>
      <li>Your score is based on the number of correct answers</li>
    </ul>
    <p>Are you ready to challenge yourself?</p>
  </CardContent>
  <CardFooter>
    <Button on:click={handleContinue}>Continue</Button>
  </CardFooter>
</Card>