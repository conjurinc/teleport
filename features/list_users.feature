Feature: Listing users

  Scenario: Listing users returns the expected results
    When I list all the "user" records
    Then the exit status should be 0
    And the output should match:
    """
dn: uid=alice,ou=user,layer=dev,o=teleport
cn: alice
gidNumber: 50000
uidNumber: 1100
objectClass: posixAccount
objectClass: shadowAccount
uid: alice
    """
    And the output should match:
    """
dn: uid=bob,ou=user,layer=dev,o=teleport
cn: bob
gidNumber: 5000
uidNumber: 1101
objectClass: posixAccount
objectClass: shadowAccount
uid: bob
    """
    And the output should not match /uid: dan/
