Feature: Listing users

  Scenario: Listing users returns the expected results
    When I list all the users
    Then the exit status should be 0
    And the output should match:
    """
dn: cn=alice,ou=users,o=teleport
uidNumber: 1100
uid: alice
cn: alice
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 50000
    """
    And the output should match:
    """
dn: cn=bob,ou=users,o=teleport
uidNumber: 1101
uid: bob
cn: bob
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 5000
    """
    And the output should match:
    """
dn: cn=charles,ou=users,o=teleport
uidNumber: 1102
uid: charles
cn: charles
objectClass: posixAccount
objectClass: shadowAccount
gidNumber: 5000
    """
    And the output should match:
    """
numEntries: 3
    """
    And the output should not match /uid: dan/
