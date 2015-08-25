<h1 id="overview">overview</h1>

Teleport is an open-source client and server tool for SSH login and access management.

The teleport server provides two back-end services which combine to provide
SSH authentication ("authn") and authorization ("authz"):

1. **Public Keys** An HTTP(S) service which provides public keys over the network for each user.
2. **LDAP** An LDAP service which implements LDAP user and group information, with customizable lists
of authorized users for each project and/or environment.

<h1 id="benefits">benefits</h1>

Each user logs in using their own private SSH key. As a result:

* You can stop SSH key sharing once and for all, which is not only bad security practice, but also
forbidden by every compliance specification.
* Each user logs in as their own personal account, which is required for compliance, and also allows
you to manage user and group permissions in the time-honored Unix way.

In addition to standard Unix fields like uid number, gid number, and login shell, the LDAP server can
also provide secondary Unix groups for each user. This feature can be used along with `/etc/sudoers.d`
to give limited root access to specific groups of users.

<h1 id="configuration">configuration</h1>

Teleport is very simple to configure. Each user and group is defined with a YAML file
in the configuration directory.

## users

Each user's YAML file is named `[username].yml`. Therefore, the name of the file assigns the user's `uid` number
(which is the name they use for SSH login). In addition, the body of the file contains YAML data:

* **publicKeys** A list of public keys, in the SSH public key format.
* **uidNumber** Unix uid number
* **primaryGroup** Id of the user's primary Unix group
* **groups** A list of secondary Unix groups.

Optionally, you can also specify other `posixAccount` and `shadowAccount` fields such as `loginShell`
and `homeDirectory`.

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

## groups

Each group has a YAML file named `[groupname].yml`. Again, the name of the file specifies the name of the group.

The YAML file contains additional data:

* **gidNumber** Unix gid number

Here's an example:

```yaml
gidnumber: 5001
```
[example/groups/scientists.yml](https://github.com/conjurinc/teleport/blob/master/example/groups/scientists.yml)

<p>&nbsp;</p>

That's it! Why should SSH configuration be any more difficult?
