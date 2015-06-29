/**
 * Simple LDAP server. Information about users and groups is stored in JSON files in a master
 * directory. Then, sub-directories are created to represent different host layers. The users
 * with access to the layer are symlinked into the layer directories.
 * 
 * The LDAP server watches the directories for changes, in order to keep the results
 * fresh.
 */

var ldap = require('ldapjs'),
	each = require('underscore').each,
	keys = require('underscore').keys,
	assert = require('assert'),
	format = require('util').format,
	info = require('winston')
	;

function dnComponents(dn) {
  var result = {};

  each(dn.rdns, function(rdn) {
    var keys = Object.keys(rdn);
    if (keys.length !== 1) {
      throw 'Unhandled RDN (expecting only one key) : ' + rdn;
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
  console.log('Request Id ' + req.logId);
  console.log('Bound as ' + req.connection.ldap.bindDN);
  console.log('Base DN ' + req.dn);
  console.log('Filter: ' + req.filter);
  
  return next();
}

function setBindLayer(req, res, next) {
  var bindDN = req.connection.ldap.bindDN;
  assert(bindDN);
  req.bindLayer = bindDN.rdns[0].cn;
  assert(req.bindLayer);
  next();
}

function createServer(options) {
  var server = ldap.createServer(options || {});

  // set request properties for easy access
  server.use(function(req, res, next) {
    req.rdns = dnComponents(req.dn);
    next();
  });

  /**
   * Binds to a specific layer.
   * 
   * cn=<layer-id>,ou=layers,o=teleport
   */
  server.bind('ou=layers,o=teleport', function(req, res, next) {
  	if ( 3 === keys(req.rdns).length && req.rdns.cn )
  		require('./ldap/bindLayer')(req, res, next);
  	else
  		next(new ldap.InvalidCredentialsError("Invalid login"));
  });
  server.unbind(function(req, res, next) {
    req.connection.ldap.auth = null;
    res.end();
    next();
  });

  /**
   * Search for users within the bound layer.
   * 
   * ou=users,o=teleport
   */
  server.search('ou=users,o=teleport', authenticate, logSearch, setBindLayer, require('./ldap/listUsers'));

  /**
   * Search for groups within the bound layer.
   * 
   * ou=groups,o=teleport
   */
  server.search('ou=groups,o=teleport', authenticate, logSearch, setBindLayer, require('./ldap/listGroups'));
  
  /**
   * Provide a server status
   */
  server.search('cn=default,ou=status,o=teleport', authenticate, logSearch, require('./ldap/status'));

  return server;
}

module.exports = createServer;
