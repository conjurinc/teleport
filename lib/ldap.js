/**
 * Simple LDAP server. Information about users and groups is stored in JSON files in a master
 * directory. Then, sub-directories are created to represent different host zones. The users
 * with access to the zone are symlinked into the zone directories.
 * 
 * The LDAP server watches the directories for changes, in order to keep the results
 * fresh.
 */

var ldap = require('ldapjs');
var each = require('underscore').each;
var format = require('util').format;
var info = require('winston').info;

function dnComponents(dn) {
  var result = {};

  each(dn.rdns, function(rdn) {
    var keys = Object.keys(rdn);
    if (keys.length !== 1) {
      throw 'Unhandled RDN ' + rdn;
    }

    var key = keys[0];
    result[key] = rdn[key];
  });

  return result;
}

function authenticate(req, res, next) {
	if ( req.connection.ldap.bindDN )
		return next();
	else
    return next(new ldap.InsufficientAccessRightsError());
}

function logSearch(req, res, next) {
  info('Searching for ' + req.dn);
  info('Bound as ' + req.connection.ldap.bindDN);
  info('Filter: ' + req.filter);
  
  return next();
}

function createServer(options) {
  var server = ldap.createServer(options || {});

  // set request properties for easy access
  server.use(function(req, res, next) {
    req.rdns = dnComponents(req.dn);
    next();
  });

  /**
   * Binds to a specific zone.
   * 
   * uid=<zone-id>,ou=zone,o=portal
   */
  server.bind('ou=zone,o=portal', function(req, res, next {
  	if ( req.rdns.length == 3 && req.rdns.uid )
  		require('./command/bindZone').bind(req, res, next);
  	else
  		next(new ldap.InvalidCredentialsError("Invalid login"));
  }));
  server.unbind(function(req, res, next) {
    req.connection.ldap.auth = null;
    res.end();
    next();
  });

  /**
   * Search for users within the bound zone.
   */
  server.search('ou=users,o=portal', authenticate, logSearch, require('./command/listUsers'));

  /**
   * Search for groups within the bound zone.
   */
  server.search('ou=groups,o=portal', authenticate, logSearch, require('./command/listGroups'));

  return server;
}

module.exports = createServer;
