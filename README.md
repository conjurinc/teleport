# Teleport

Teleport is an open-source client and server tool for SSH login and access management.

The teleport server provides two services:

* **Public Keys** An HTTP(S) service which makes users' public keys available.
* **LDAP** An LDAP server which implements `posixAccount`, `shadowAccount`, and `posixGroup`. This 
functionality is sufficient to hook up Linux PAM for user, shadow, and group information.

# Benefits

First, each user logs in using their **own** private SSH key. As a result:

* You can stop SSH key sharing once and for all, which is not only bad security practice, but also forbidden by 
every compliance specification.
* Each user logs in as their own personal account, which is required for compliance, and also allows you to
manage user and group permissions in the time-honored Unix way.

The LDAP server provides multiple SSH "layers". The user list can be different for each layer, so you can
maintain `dev` and `prod` layers which are accessible to different people. So:

* You can segment your systems according to their security needs.
* You can easily raise or lower user privileges to specific systems.

The LDAP server provides secondary Unix groups in addition to the main "primary" group. 
Secondary groups:

* Can be used along with `/etc/sudoers.d` to give limited `root` access to specific groups of users.

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
`homeDirectory`. Here's an example of `alice.yml`:

```yaml
primaryGroup: admins
groups: 
- users
uidNumber: 1100
publicKeys:
- ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC9yf0ZKmg0vTPq7FAyAUGr5EBRjJBZM7CBQy9K/1Ryc9cDL6b25d3nVcNNsIa2SYtHvUR8bKeAc6PIEbEdh+aayqCMutRxjRNg4PVb4i7T/OZekziA2Eai4XflNe5RHSPkDk/OcAzP+Q5/4hjyzwoMqTiNsBlXTDCwQaW9nx7q4bSfrQOgMlpERMJVJl3Q/fGQOEI7HFbsetqItUrwmK5Kr0xkCwAk5GyWjN52ADBOMatNEVd+8c7GXzCtM90o+iHAIViUeIUdYajvv7il64kB7tyc+kCjDvvVrgtHRs4RmnlxFxG1EFHyZEfJPX1yJvy8E82FZN7vakJ8nuFlnLRx alice@laptop
```

## Groups

Each group has a YAML file named `[groupname].yml`. Again, the name of the file specifies the name of the group.

The YAML file contains additional data:

* **gidNumber** Unix gid number

# Developpment

Install dependencies:

```
$ npm install
``

Install `nodemon` for automatic code reloading:

```
$ npm install -g nodemon
```

Run the LDAP server:

```
$ env LDAP_LAYER_DEV_PASSWORD=foobar nodemon ./ldap.js --directory example
```

In a second terminal, bind as the `dev` layer and show the server status:

```
$ ldapsearch -H ldap://localhost:1389 -b "cn=default,ou=status,o=teleport" -D "cn=dev,ou=layers,o=teleport" -w foobar "objectclass=*"
```
