var async = require('async'),
	log = require('../logging').logLDAP,
	assert = require('assert'),
	keys = require('underscore').keys,
	ldap = require('ldapjs'),
	format = require('util').format,
	dataStore = require('../dataStore')
	;

/**
 * Bind a 3-token DN by verifying the credential (a password) of a layer. The DN is required
 * to be in the form:
 *
 *   cn=<layer-id>,ou=layers,o=teleport
 *
 * On successful bind, an auth 'token' is stored on the connection. The token contains
 * a timestamp indicating when the bind occurred. This enables binds to expire.
 */

function bind(req, res, next) {
	assert(3 === keys(req.rdns).length);
	assert('teleport' === req.rdns.o);
	assert('layers' === req.rdns.ou);
  var layer = req.rdns.cn;
  dataStore.authenticate(layer, req.credentials, function(err) {
  	if ( err )
  		return next(err);
  	
  	var auth = {
  		timestamp: new Date()
    }
  	req.connection.ldap.auth = auth;
    log.debug({requestId: req.logId, command: 'bind', dn: req.dn.toString()}, 'Bound as %s', req.dn);
    res.end();
    next();
  });
}

module.exports = bind;
