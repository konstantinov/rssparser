require('isomorphic-fetch');
const Entities = require('html-entities').XmlEntities;
const url = require('url');
const xmlDecoder = new Entities();
const xjs = require('xml2js').parseString;

const rssParse = url => fetch(url)
	.then(r => r.text())
	.then(xml => new Promise(resolver => xjs(xml, (e,r) => resolver(r))))
	.then(js => js.rss ? prepareRSS(js.rss.channel[0], url) : prepareAtomFeed(js.feed, url));

module.exports = rssParse;

function postProcess(posts) {
	return Promise.all(
		posts.map(post => 
			getSiteInfo(post.link)
				.then(siteInfo => {
					post.hasVideo = siteInfo.hasVideo;
					post.image    = siteInfo['og:image'];
				})
		)
	)
}

function prepareAtomFeed(feed, xmlUrl) {
	const siteUrl = feed.link.find(s => s['$'].rel !== 'self')['$'].href;
	
	return getSiteInfo(siteUrl)
		.then(sd => ({
			id: feed.id[0],
			siteName: siteUrl,
			siteIcon: sd.siteIcon,
			title: feed.title[0],
			keywords: sd.keywords,
			author: feed.author && {
				name: feed.author[0].name[0],
				url: feed.author[0].uri[0]
			},
			description: feed.description && feed.description[0],
			hasDates: !!feed.entry.find(i => i.published && i.published[0]),
			description:feed.description && feed.description[0],
			xmlUrl: xmlUrl,
			posts: feed.entry.map(i => ({
				id: tagContent(i.id[0]),
				title: i.title[0],
				site: url.resolve(i.link[0]['$'].href, '/'),
				plainDescription: i['media:group'][0]['media:description'][0],
				hasHTML: false,
				link: i.link[0]['$'].href,
				author: i.author && {
					name: i.author[0].name[0],
					url: i.author[0].uri[0]
				},
				date: i.published && i.published[0]
			}))
		}))
		.then(info => postProcess(info.posts).then(() => info));
}

function getSiteInfo(siteUrl) {

	return fetch(siteUrl)
		.then(r => r.text())
		.then(html => {
			// console.log(html);
			const { 0: data } = html.match(/<head(\s+[^>]*?)?>.+<\/head>/si) || [];

			if (!data)
				return {};

			const metas = data
				.match(/<meta[^>]+>/ig)
				.reduce((tags, tag) => {
					const { 1: name    } = tag.match(/(?:name|property)=["']([^"'"]+?)["']/si) || [];
					const { 1: content } = tag.match(/content=["']([^"'"]+?)["']/si) || [];

					if (name && content)
						tags[name] = xmlDecoder.decode(content);

					return tags;
				}, {});


			const { 1: title } = data.match(/<title>([^<]+?)<\/title>/si) || [];

			if (title) 
				metas.siteName = xmlDecoder.decode(title);
			
			metas.hasVideo = !!metas['og:type'];

			const { 0: favicon } =  data
				.match(/<link[^>]+>/sig)
				.filter(tag => tag.match(/rel=["'](icon|shortcut)/))
				.map(tag => tag.match(/href=["']([^"']+)["']/) || []) //
				.map(value => value[1] && url.resolve(siteUrl, value[1]));

			if (favicon)
				metas.siteIcon = favicon;

			return metas;
		})
}

const tagContent =	 t => typeof t === 'object' ? t._ : t

function prepareRSS(ch, xmlUrl) {
	

	return getSiteInfo(ch.link[0])
		.then(sd => ({
			id: ch.link[0],
			title: ch.title[0],
			description: ch.description && ch.description[0] || sd.description,
			xmlUrl: xmlUrl,
			keywords: sd.keywords,
			siteName: ch.link[0],
			siteIcon: sd.siteIcon,
			hasDates: !!ch.item.find(i => i.pubDate && i.pubDate[0]),
			category: Object.keys(ch.item.reduce(
				(acc, v) => {
					if (!v.category)
						return acc;
					v.category.forEach(c => {
						const name = tagContent(c);

						acc[name] = true;
					});

					return acc;
				}, {}
			)),
			posts: ch.item.map(i => ({
				id: tagContent(i.guid[0]),
				title: i.title[0],
				site: url.resolve(i.link[0], '/'),
				plainDescription: i.description && i.description[0],
				description: i['content:encoded'] && i['content:encoded'][0],
				hasHTML: !!i['content:encoded'],
				link: i.link[0],
				category: i.category && i.category.map(c => tagContent(c)),
				date: i.pubDate && i.pubDate[0]
			}))
		}))
		.then(info => postProcess(info.posts).then(() => info));
}