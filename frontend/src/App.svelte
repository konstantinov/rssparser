<script>
	
	import { onMount } from 'svelte';
	import Feed from './Feed.svelte';
	import qs from 'query-string';
	import { compareDesc } from 'date-fns';
	let query;
	let loading;

	onMount(() => {
		const { q } = qs.parse(document.location.search);

		if (q) {
			query = q;
			startSearch(q);
		}
	});

	function startSearch(query) {
		loading = fetch(`/api/?q=${encodeURIComponent(query)}`)
			.then(r => r.json())
			.then(feed => {
				feed.posts = feed.posts
				.map(p => ({
						...p,
						date: new Date(p.date)
					}))
					.sort((a, b) => compareDesc(a.date, b.date));

				return feed;
			})
			.catch(e => ({ error: e.toString() }))
	}
</script>
{#if !loading}
<div class="ui container" id="index">
	
	<h1 class="ui header centered">RSS</h1>
<div class="ui category search">
			  <div class="ui icon input">
			    <input class="prompt" type="text" 
			    	bind:value={query} 
			    	on:keyup={e => e.key == "Enter" && startSearch(query)}
			    	placeholder="Type URL and hit enter"
			    />
			    <i class="search icon"></i>
			  </div>
			</div>
</div>
{:else}
<div class="fullscreen">
<header>
<div class="ui container">
	<div class="ui text menu">
		<div class="item">RSS</div>
		<div class="item search">
			<div class="ui small input category search">
					<div class="ui icon input">
			    <input class="prompt" type="text" 
			    	bind:value={query} 
			    	on:keyup={e => e.key == "Enter" && startSearch(query)}
			    	placeholder="Query ID"
			    />
			    <i class="search icon"></i>
			  </div>

			</div>
		</div>
	</div>
</div>
</header>
	  		{#await loading}
	  			  <div class="ui active centered massive inline loader" id="big"></div>
	  		{:then data}
	  				
	  			{#if data.error}
	  			  <div class="ui container my">
	  				<div class="ui icon error message">
	  					<i class="icon circle warning"></i>
	  				{data.error}</div>
	  			</div>
	  			{:else}
		  			<div class="ui container my">
		  				<Feed feed={data} />
		  			</div>
	  			{/if}

	  		{/await}
</div>
{/if}


<style>
	header {
		background-color: #F5F5F5;
	    border-bottom: 1px solid #E5E5E5;
	    padding: 0px;
	}
	.search.item {    flex-grow: 1;}
	.search .input { width: 100%; }
	#index .header { margin-top: 10vh; }
	.text.menu { margin-top:0;margin-bottom:0; flex-direction: row; }
	.text.menu .icon { padding: 0; }
	#logo.ui { height: 32px; }
	#big { margin-top: 10vh; }
	.my { padding-top: 1rem; }
	.fullscreen {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
</style>