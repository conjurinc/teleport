# Teleport

Teleport is an open-source client and server tool for SSH login and access management.

The teleport server provides two back-end services which combine to provide SSH authentication
("authn") and authorization ("authz"):

1. **Public Keys** An HTTP(S) service which provides public keys over the network for each user. 
2. **LDAP** An LDAP service which implements LDAP user and group information, with customizable
lists of authorized users for each project and/or environment.  

# Benefits

Each user logs in using their own private SSH key. As a result:

* You can stop SSH key sharing once and for all, which is not only bad security practice, but also forbidden by 
every compliance specification.
* Each user logs in as their own personal account, which is required for compliance, and also allows you to
manage user and group permissions in the time-honored Unix way.

The LDAP server provides multiple SSH "layers", each of which can have a different authorized user list.
For example, you can use layers to maintain `dev` and `prod` environments which are accessible to different 
sets of people. In this way, you can segment your systems according to their security needs.

In addition to standard Unix fields like uid number, gid number, and login shell, the LDAP server can also provide secondary Unix groups for each user. This feature can be used along with `/etc/sudoers.d` to give limited `root` access to specific groups of users.

# Configuration

Teleport is very simple to configure. Each user and group has a YAML file in the configuration directory.

## Users

Each user's YAML file is named `[username].yml`. Therefore, the name of the file assigns the user's `uid` number
(which is the name they use for SSH login). In addition, the body of the file contains YAML data:

* **publicKeys** A list of public keys, in the SSH public key format.
* **uidNumber** Unix uid number
* **primaryGroup** Id of the user's primary Unix group
* **groups** A list of secondary Unix groups.

Optionally, you can also specify other `posixAccount` and `shadowAccount` fields such as `loginShell` and 
`homeDirectory`.

Here's an example: 

```yaml
primaryGroup: admins
groups: 
- users
uidNumber: 1100
publicKeys:
- ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC9yf0ZKmg0vTPq7FAyAUGr5EBRjJBZM7CBQy9K/1Ryc9cDL6b25d3nVcNNsIa2SYtHvUR8bKeAc6PIEbEdh+aayqCMutRxjRNg4PVb4i7T/OZekziA2Eai4XflNe5RHSPkDk/OcAzP+Q5/4hjyzwoMqTiNsBlXTDCwQaW9nx7q4bSfrQOgMlpERMJVJl3Q/fGQOEI7HFbsetqItUrwmK5Kr0xkCwAk5GyWjN52ADBOMatNEVd+8c7GXzCtM90o+iHAIViUeIUdYajvv7il64kB7tyc+kCjDvvVrgtHRs4RmnlxFxG1EFHyZEfJPX1yJvy8E82FZN7vakJ8nuFlnLRx alice@laptop
```
[example/users/alice.yml](https://github.com/conjurinc/teleport/blob/master/example/users/alice.yml)

## Groups

Each group has a YAML file named `[groupname].yml`. Again, the name of the file specifies the name of the group.

The YAML file contains additional data:

* **gidNumber** Unix gid number

Here's an example: 

```yaml
gidnumber: 5001
```
[example/groups/scientists.yml](https://github.com/conjurinc/teleport/blob/master/example/groups/scientists.yml)

## Layers

Each layer is represented by a directory. The YAML file of each user that should have access to the layer
is symlinked into this directory.

Example: [example/layers/dev](https://github.com/conjurinc/teleport/blob/master/example/layers/dev)

That's it! Why should SSH configuration be any harder?

# Development

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
