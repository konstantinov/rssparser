<script>
	export let feed;
	import { formatDistance, differenceInWeeks, format } from 'date-fns';

	const dateToString = (date) => differenceInWeeks(new Date(), date) < 1 ? formatDistance(date, new Date(), { addSuffix: true} ) : format(date, 'MM/dd/yyyy');
		
</script>

<h1 class="ui header centered">{feed.title}</h1>

<div class="ui grid">
		{#each feed.posts as post}
		<div class="four wide computer four wide tablet eight wide mobile column">
			<img class="ui rounded image" src="{post.image}" alt="{post.title}" />
			<span class="date">{dateToString(post.date)}</span> {post.title}
		</div>
		{/each}
</div>

<style>
	.date { font-weight: bold; }
</style>