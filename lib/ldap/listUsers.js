var async = require('async'),
	format = require('util').format,
	assert = require('assert'),
	ldap = require('ldapjs'),
	keys = require('underscore').keys,
	clone = require('underscore').clone,
	map = require('underscore').map,
	dataStore = require('../dataStore'),
	parseDN = require('ldapjs').parseDN,
	info = require('winston').info
	;


/**
 * Lists all the users within the bound layer.
 * 
 * (uid=<user-id>,)?ou=users,o=teleport
 */
function listUsers(req, res, next) {
	assert([ 2, 3 ].indexOf(keys(req.rdns).length) !== null);
	
	assert('teleport' === req.rdns.o);
	assert('users' === req.rdns.ou);
	var layer = req.bindLayer;
	assert(layer);
	// If searching for a specific user
	var uid = req.rdns.uid;

  if ( uid ) {
    req.filter = new ldap.AndFilter({
      filters: [req.filter, new ldap.EqualityFilter({attribute: 'uid', value: uid})]
    });
  }
	
	function end(err) {
    res.end();
		next(err);
	}

	dataStore.layerUsers(layer).on('user', function(user) {
    var attributes = clone(user);
    // Apply some defaults
    if ( !attributes.uid ) attributes.uid = user.uid;
    if ( !attributes.cn ) attributes.cn = user.uid;
    if ( !attributes.objectClass ) attributes.objectClass = ['posixAccount', 'shadowAccount'];
    attributes.gidNumber = user.primaryGroup.gidNumber;
    delete attributes['primaryGroup'];
    delete attributes['groups'];
    delete attributes['publicKeys'];
    
    if (req.filter.matches(attributes)) {
    	var dn = format("cn=%s,ou=users,o=teleport", user.uid);
    	console.log(format("Sending user %s", dn));
      res.send({
        dn: dn,
        attributes: attributes
      });
    }
	})
		.on('error', end)
		.on('end', end)
		;
}

module.exports = listUsers;