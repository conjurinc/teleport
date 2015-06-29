var async = require('async'),
	assert = require('assert'),
	keys = require('underscore').keys,
	ldap = require('ldapjs'),
	format = require('util').format,
	dataStore = require('../dataStore'),
	info = require('winston').info
	;

/**
 * Bind a 3-token DN by verifying the credential (a password) of a layer. The DN is required
 * to be in the form:
 *
 *   uid=<uid>,ou=layer,o=portal
 *
 * * uid: the layer id.
 *
 * On successful bind, an auth 'token' is stored on the connection. The token contains
 * a timestamp indicating when the bind occurred. This enables binds to expire.
 */

function bind(req, res, next) {
	assert(3 === keys(req.rdns).length);
  var layer = req.rdns.cn;
  dataStore.authenticate(layer, req.credentials, function(err) {
  	if ( err )
  		return next(err);
  	
  	var auth = {
  		timestamp: new Date()
    }
  	req.connection.ldap.auth = auth;
    info(format('Bound as %s at %s', req.dn, auth.timestamp));
    res.end();
    next();
  });
}

module.exports = bind;
