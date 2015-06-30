var fs = require('fs');

if ( fs.existsSync('/etc/ssl/certs') )
  require('crypto-cacerts').cryptoPatch('/etc/ssl/certs');

var each = require('underscore').each,
	format = require('util').format,
	assert = require('assert')
	;
  
var optimist = require('optimist')
  .default('directory', 'data')
  .default('key')
  .default('certificate')
  .default('log-level', 'info')
  .default('ca')
  .default('port');
var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

var logLevel;
if ( logLevel = argv['log-level'] ) {
	require('./lib/logging').initializeLogging({level: logLevel})
}

var log = require('./lib/logging').logLDAP;

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
  log.info({ca: argv.ca})
  opts.ca = fs.readFileSync(argv.ca, 'utf8');
}

require('./lib/dataStore').initialize(argv.directory, function(err) {
	if ( err ) {
		log.fatal(err);
		return process.exit(1);
	}
	var server = require('./lib/ldap')(options);
	var port = parseInt(argv.port);

	server.listen(port, function() {
	  log.info({url: server.url}, 'LDAP server listening at: %s', server.url);
	});
});
