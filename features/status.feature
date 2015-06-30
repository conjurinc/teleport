Feature: Server status

  Scenario: The server provides a status record
    When I search for server default status
    Then the exit status should be 0
    
