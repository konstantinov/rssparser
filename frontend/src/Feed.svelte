<script>
	export let feed;
	import { formatDistance, differenceInWeeks, format } from 'date-fns';

	const dateToString = (date) => differenceInWeeks(new Date(), date) < 1 ? formatDistance(date, new Date(), { addSuffix: true} ) : format(date, 'MM/dd/yyyy');
		
</script>

<h1 class="ui header centered">{feed.title}</h1>

<div class="ui grid">
		{#each feed.posts as post}
		<div class="four wide computer four wide tablet eight wide mobile column">
			<a href="{post.link}" target="_blank">
				{#if post.image}
				<div class="image-container">
					<img class="ui rounded image" src="{post.image}" alt="{post.title}" />
					{#if post.hasVideo}
					<div class="icon-container">
					<i class="play icon"></i>
					</div>
					{/if}
				</div>
				{/if}
				<span class="date">{dateToString(post.date)}</span> {post.title}
			</a>
		</div>
		{/each}
</div>

<style>
	.date { font-weight: bold; }
	.image-container {
		position: relative;
	}

	.image-container .icon-container {
		position: absolute;
		top:50%;
		left:50%;
		overflow:hidden;
		line-height: 60px;
		opacity: 0.7;
		transform: translate(-50%,-50%);
		color:#fff;
		font-size: 400%;
	}
</style>