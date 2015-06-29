When(/^I bind as a layer/) do
  ldapsearch
end

When(/^I bind as a non-existent layer$/) do
  ldapsearch cn: 'foobar'
end

When(/^I bind the layer with an invalid password$/) do
  ldapsearch pw: 'foobar'
end

Then(/^it succeeds$/) do
  step "the exit status should be 0"
end

When(/^I list all the users$/) do
  ldapsearch search_base: "ou=users,o=teleport"
end
