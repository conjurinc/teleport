var fs = require('fs');

if ( fs.existsSync('/etc/ssl/certs') )
  require('crypto-cacerts').cryptoPatch('/etc/ssl/certs');

var each = require('underscore').each,
	info = require('winston').info,
	format = require('util').format,
	assert = require('assert')
	;
  
var optimist = require('optimist')
  .default('directory', 'data')
  .default('key')
  .default('certificate')
  .default('ca')
  .default('port');
var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

var options = {};
each(['key', 'certificate'], function(k) {
  if ( argv[k] )
    options[k] = fs.readFileSync(argv[k], 'ascii');
});

if ( !argv.port )
  argv.port = process.env.PORT;
  
if ( !argv.port ) {
  if ( options.key )
    argv.port = "3636";
  else
    argv.port = "1389";
}

if ( argv.ca ) {
  var opts = require('https').globalAgent.options;
  info(format("Using CA %s", argv.ca))
  opts.ca = fs.readFileSync(argv.ca, 'utf8');
}

require('./lib/dataStore').initialize(argv.directory, function(err) {
	if ( err ) {
		console.warn(err);
		return process.exit(1);
	}
	var server = require('./lib/ldap')(options);
	var port = parseInt(argv.port);

	server.listen(port, function() {
	  info('LDAP server listening at: ' + server.url);
	});
});
