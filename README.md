<div align="center">
  <h1>Teleport</h1>
  <img src="https://conjurinc.github.io/teleport/images/logo.png" height="200"/>
  <h3>simple SSH login and access management</h3>
</div>

---

Teleport is an open-source client and server tool for SSH login and access management.

The teleport server provides two back-end services which combine to provide SSH authentication
("authn") and authorization ("authz"):

1. **Public Keys** An HTTP(S) service which provides public keys over the network for each user. 
2. **LDAP** An LDAP service which implements LDAP user and group information, with customizable
lists of authorized users for each project and/or environment.

## Documentation

All documentation is available on the Teleport website

https://conjurinc.github.io/teleport

## Development

Install dependencies:

```sh-session
$ npm install
```

Install `nodemon` for automatic code reloading:

```sh-session
$ npm install -g nodemon
```

Run the LDAP server:

```sh-session
$ env LDAP_LAYER_DEV_PASSWORD=foobar nodemon ./ldap.js --directory example
```

In a second terminal, bind as the `dev` layer and list the users:

```sh-session
$ ldapsearch -LLL -H ldap://localhost:1389 \
  -b "ou=users,o=teleport" \
  -D "cn=dev,ou=layers,o=teleport" \
  -w foobar \
  "objectclass=*"
dn: cn=alice,ou=users,o=teleport
uidNumber: 1100
uid: alice
cn: alice
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 50000

dn: cn=bob,ou=users,o=teleport
uidNumber: 1101
uid: bob
cn: bob
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 5000

dn: cn=charles,ou=users,o=teleport
uidNumber: 1102
uid: charles
cn: charles
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 5000
```
