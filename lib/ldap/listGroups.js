var log = require('../logging').logLDAP,
	format = require('util').format,
	assert = require('assert'),
	cb = require('cb'),
	ldap = require('ldapjs'),
	keys = require('underscore').keys,
	values = require('underscore').values,
	clone = require('underscore').clone,
	extend = require('underscore').extend,
	map = require('underscore').map,
	dataStore = require('../dataStore')
	;

/**
 * Lists all the groups within the bound layer.
 * 
 * ou=groups,o=teleport
 */
function listGroups(req, res, next) {
	function logContext(context) {
		if ( !context ) context = {};
		return extend({requestId: req.logId, command: 'listGroups'}, context);
	}

	assert([ 2 ].indexOf(keys(req.rdns).length) !== null);
	assert('teleport' === req.rdns.o);
	assert('groups' === req.rdns.ou);
	var layer = req.bindLayer;
	assert(layer);
	
	/**
	 * Load the groups into a hash by group cn.
	 * Also initialize the memberUid list.
	 */
  function loadGroups(callback) {
  	var groups = {}
  	var respond = cb(function(err) {
  		callback(err, groups);
  	});
  	dataStore.groups().on('group', function(group) {
  		group = clone(group);
  		delete group['members'];
  		group.memberUid = [];
  		groups[group.cn] = group;
  	})
  	.on('end', respond)
  	.on('error', respond)
  	;
  }

  /**
   * Populate the memberUid list of each group by enumerating the users.
   */
  function loadUsers(groups, callback) {
  	var resultCount = 0;
  	var respond = cb(function(err) {
  		callback(err, groups);
  	});
  	dataStore.layerUsers(layer).on('user', function(user) {
    	function addGroup(group) {
    		var ldapGroup = groups[group.cn];
    		log.debug(logContext({user: user.uid, group: group.cn}), "Adding user %s to group %s", user.uid, group.cn);
    		assert(ldapGroup);
    		ldapGroup.memberUid.push(user.uid);
    	}
  		addGroup(user.primaryGroup);
  		user.groups.forEach(addGroup);
  	})
	  	.on('error', respond)
			.on('end', respond)
			;
  }
  
  async.waterfall([loadGroups,
                   loadUsers
                   ], function(err, groups) {
  	if ( err ) 
  		return next(err);
  	
  	var resultCount = 0;
  	// Send all groups with at least one member
  	// Lets get a stable group order
  	keys(groups).sort().forEach(function(cn) {
  		var group = groups[cn];
  		group.objectClass = [ "posixGroup" ];
  		if ( process.env.LDAP_SORT_MEMBER_UID)
  			group.memberUid.sort();
    	var dn = format("cn=%s,ou=groups,o=teleport", group.cn);
  		log.debug(logContext({group: group.cn}), "Considering group %s", dn);
  		if ( 0 === group.memberUid.length ) {
    		log.debug(logContext({group: group.cn}), "Group %s has no members in this layer", group.cn);
  			return;
  		}
      if (req.filter.matches(group)) {
      	++resultCount;
      	log.debug(logContext({ dn: dn}), "Sending group %s", dn);
        res.send({
          dn: dn,
          attributes: group
        });
      }
  	});
		log.info(logContext({resultCount: resultCount}), "Sent %d groups", resultCount);
  	
  	res.end();
  	next();
  });
}
	
module.exports = listGroups;