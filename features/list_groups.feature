Feature: Listing users

  Scenario: Listing groups returns the expected results
    When I list all the groups
    Then the exit status should be 0
    And the output should match:
    """
dn: cn=conjurers,ou=groups,o=teleport
gidNumber: 50000
cn: conjurers
memberUid: alice
objectClass: posixGroup
    """
    And the output should match:
    """
dn: cn=scientists,ou=groups,o=teleport
gidNumber: 5001
cn: scientists
memberUid: bob
memberUid: charles
objectClass: posixGroup
    """
    And the output should match:
    """
dn: cn=users,ou=groups,o=teleport
gidNumber: 5000
cn: users
memberUid: alice
memberUid: bob
memberUid: charles
objectClass: posixGroup
    """
    And the output should match:
    """
numEntries: 3
    """
