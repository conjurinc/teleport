
/**
 * Simple web service to serve public keys from a static directory.
 * The directory contains a set of files; each filename is a user name, and the
 * contents of the file are the public keys of that user.
 */

var express = require('express'),
	dataStore = require('./dataStore')
	;

var app = express();

app.get('/:user', function(req, res) {
	var uid = req.params.user;
	dataStore.publicKeys(uid, function(err, keys) {
		if ( err )
			return res.end(500);
		if ( !keys )
			return res.end(404);
		
		keys.each(function(key) {
			res.send(key);
			res.send("\n")
		});
		res.end(200);
	});
})

dataStore.initialize('example', function(err) {
	if ( err ) {
		console.log(err);
		return process.exit(1);
	}

	var server = app.listen(3000, function () {
	  var host = server.address().address;
	  var port = server.address().port;

	  console.log('Example app listening at http://%s:%s', host, port);
	});
})

