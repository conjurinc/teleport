require 'tempfile'

module LDAPWorld
  def ldapsearch(options={})
    layer = options[:cn] || 'dev'
    bind = options[:bind] || "cn=#{layer},ou=layer,o=teleport"
    pw = options[:pw] || 'the-dev-password'
    search_base = options[:search_base] || "cn=default,ou=status,o=teleport"
    query = options[:query] || "objectclass=*"

    cmd = <<-EOF.gsub(/\s+/, ' ')
      ldapsearch \
        -H ldap://localhost:1389 \
        -b "#{search_base}"
        -D "#{bind}" \
        -w #{pw} \
        "#{query}"
    EOF
    
    puts cmd

    step("I run `#{cmd}`")
  end
end

World(LDAPWorld)
