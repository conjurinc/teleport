require 'background_process'
command = "env LDAP_LAYER_DEV_PASSWORD=the-dev-password node ./ldap.js --directory example"
$process = BackgroundProcess.run command  
sleep 1
$process_thread = Thread.new do
  if $process.running?
    puts $process.stdout.read
    puts $process.stderr.read
  end
end
raise "Can't run #{command}" unless $process.running?
 
at_exit do
  $process_thread.kill
  $process.kill("TERM")
end
