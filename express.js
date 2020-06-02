
var proxy = require('express-http-proxy');
var app   = require('express')();
var rssParse = require('./parse');
app.use('/api/', (req, res) => {
	const q = req.param('q');

	if (q)
		rssParse(q)
			.then(feed => res.send(feed));
	else 
		res.send({ error: 'No query specified'});

});

app.use('/', proxy('http://127.0.0.1:5000')); 
app.listen(5001);