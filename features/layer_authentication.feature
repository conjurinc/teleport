Feature: Binding a layer

  Scenario: Bind as a non-existent layer
    When I bind as a non-existent layer
    Then the output should match:
    """
    additional info: Invalid login for layer foobar
    """
    And the exit status should be 49

  Scenario: Bind with an invalid layer password
    When I bind the layer with an invalid password
    Then the output should contain:
    """
    additional info: Invalid login for layer dev
    """
    And the exit status should be 49

  Scenario: Bind with a valid layer password
    When I bind as a layer
    Then the output should contain:
    """
    # numEntries: 1
    """
    And the output should contain:
    """
    dn: cn=default,ou=status,o=teleport
    """