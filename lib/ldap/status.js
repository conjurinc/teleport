var ldap = require('ldapjs')
	;

function status(req, res, next) {
	res.send({
    dn: "cn=default,ou=status,o=teleport",
    attributes: {
    }
  });
	res.end();
	next();
}

module.exports = status;
