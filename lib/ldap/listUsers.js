var async = require('async'),
	ldap = require('ldapjs'),
	dataStore = require('./dataStore'),
	info = require('winston').info
	;


function listUsers(req, res, next) {
	var zone = req.rdns.zone;
	var baseDN = [ new ldap.RDN({ou: 'user'}), new ldap.RDN({o: 'portal'}) ]

  if (req.rdns.uid) {
    req.filter = new ldap.AndFilter({
      filters: [req.filter, new ldap.EqualityFilter({attribute: 'uid', value: req.rdns.uid})]
    });
  }

	var userList = dataStore.zoneUsers(zone);
	userList.on('user', function(user) {
    if (req.filter.matches(user)) {
  		var dn = baseDN.clone();
      dn.unshift(new ldap.RDN({uid: user.uid}));
      var attributes = user.clone();
      // Apply some defaults
      if ( !attributes.cn ) attributes.cn = user.uid;
      if ( !attributes.objectClass ) attributes.objectClass = ['posixAccount', 'shadowAccount'];
      res.send({
        dn: dn,
        attributes: attributes
      });
    }
	})
	userList.on('error', function(err) {
	    res.end();
			next(err);
	})
	userList.on('end', function() {
	    res.end();
			next();
	});
}

module.exports = listUsers;