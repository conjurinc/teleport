var bunyan = require('bunyan')
	extend = require('underscore').extend
	;

function initializeLogging(options) {
	var options = extend({name: 'teleport'}, options);
	var logger = bunyan.createLogger(options);
	module.exports.logDataStore = logger.child({service: 'dataStore'});
	module.exports.logLDAP = logger.child({service: 'ldap'});
	module.exports.logPubkeys = logger.child({service: 'pubkeys'});
}

initializeLogging({});

module.exports = {
		initializeLogging: initializeLogging
}
