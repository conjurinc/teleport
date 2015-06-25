var async = require('async'),
	ldap = require('ldapjs'),
	dataStore = require('./dataStore'),
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
  function verifyPassword(password, callback) {
  	if ( req.credentials === password )
  		callback(null);
  	else
  		callback(new ldap.InvalidCredentialsError("Invalid login"));
  }
  
  function storeAuthentication(callback) {
  	return function(err) {
    	if ( err )
    		return callback(err);
    	
    	var auth = {
	  		timestamp: new Date()
      }
    	req.connection.ldap.auth = auth;
      info(format('Bound as %s at %s', req.dn, auth.timestamp);

      res.end();
      callback();
  	}
  }
  
  async.waterfall(dataStore.layerPassword,
  		verifyPassword,
  		storeAuthentication(next))
}

module.exports = bind;
