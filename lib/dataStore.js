/**
 * Provides search functions over the data store, which is file-based.
 */
var fs = require('fs'), 
	format = require('util').format, 
	chokidar = require('chokidar'),
	async = require('async'),
	cb = require('cb'),
	u = require('underscore'),
	yaml = require('js-yaml')
	;

var store;

function findZone(id) {
	u.find(store.zones, function(zone) {
		return id === zone.id;
	})
}

function findUser(id) {
	u.find(store.users, function(user) {
		return id === user.uid;
	})
}

/**
 * Finds the public keys of a user in the data store. If the user is not found,
 * the key list is +null+. If the user is found, but has no public keys, the key
 * list is an empty Array. Otherwise, it's an Array of the user's public keys.
 * 
 * Each key is guaranteed to span only one line, and to not end with a newline.
 */
function publicKeys(uid) {
	var user = findUser(uid);
	if ( !user )
		return null;
	else
		return user.publicKeys;
}

/**
 * Provides the password for a zone. It's obtained from the pluggable secrets
 * provider.
 * 
 * @callback error, String
 */
function zonePassword(zone, callback) {

}

/**
 * Provides the user list for a zone.
 */
function zoneUsers(zone) {
	var zone = findZone(zone)
	if ( !zone ) return [];
	return zone.users;
}

/**
 * Provides the list of groups for a zone. The result is a list of every group
 * that is held by at least one member of the zone. The user list on each group
 * is just those users with access to the zone.
 */
function zoneGroups(zone) {
	var zone = findZone(zone)
	if ( !zone ) return [];
	
	var result = [];
	zone.users.forEach(function(user) {
		result.push(user.primaryGroup);
		result.concat(user.groups);
	})
	return u.uniq(result);
}

/**
 * Load the data store.
 * 
 * @param callback
 *          err, data
 */
function load(dir, callback) {
	
	/**
	 * Read the files in a directory. Each entry in the directory is passed to 
	 * +fn+. If the entry is a regular file, the body is passed to +fn+ along with the filename;
	 * otherwise it's just the filename.
	 * 
	 * Once all the files are listed, the callback is invoked with (err, result), where
	 * result is the accumulated output of all the +fn+ invocations.
	 */
	function loadDir(dir, fn, callback) {
		callback = cb(callback);
		
		var result = [];
		
		fs.readdir(dir, function(err, files) {
			if ( err ) return callback(err);
			
			var c = files.length;
			function accumulate() {
				try {
					result.push(fn.apply(null, Array.prototype.slice.call(arguments)));
				}
				catch (err) {
					return callback(err);
				}
				if ( 0 === --c ) {
					callback(null, result);
				}
			}
			
			files.forEach(function(file) {
				var fname = [ dir, file ].join('/');
				fs.lstat(fname, function(err, stats) {
					if ( err ) return callback(err);
					
					if ( stats.isFile() ) {
						fs.readFile(fname, 'utf-8', function(err, contents) {
							if ( err ) return callback(err);
							
							accumulate(file, contents);
						});
					}
					else if ( stats.isDirectory() ) {
						accumulate(file);
					}
					else if ( stats.isSymbolicLink() ) {
						accumulate(file);
					}
				});
			});
		});
	}

	/**
	 * Transform a filename into a uid, by splitting on '.'.
	 */
	function fileUid(filename) {
		var tokens = filename.split('.');
		if ( tokens.length === 0 )
			return tokens[0];
		return tokens.slice(0, tokens.length-1).join('.');
	}
	
	/**
	 * Load the users from the users/ directory. The uid is populated
	 * on each one.
	 */
	function loadUsers(callback) {
		loadDir([ dir, 'users' ].join('/'), function(filename, contents) {
			var user = yaml.safeLoad(contents);
			user.uid = fileUid(filename);
			if ( !user.publicKeys ) user.publicKeys = [];
			return user;
		}, callback)
	}

	/**
	 * Load the users from the groups/ directory. The gid is populated
	 * on each one.
	 */
	function loadGroups(callback) {
		loadDir([ dir, 'groups' ].join('/'), function(filename, contents) {
			var group = yaml.safeLoad(contents);
			group.uid = fileUid(filename);
			return group;
		}, callback)
	}

	/**
	 * Load the authorization zones from the zones/ directory. Each Zone has an id
	 * and a +users+ field which lists the uid numbers of the users in the zone.
	 */
	function loadZones(callback) {
		callback = cb(callback);
		
		loadDir([ dir, 'zones' ].join('/'), function(dirname) {
			return {
				id: dirname
			}
		}, function(err, zones) {
			if ( err ) return callback(err);
			
			var c = zones.length;
			zones.forEach(function(zone) {
				zone.users = [];
				loadDir([ dir, 'zones', zone.id ].join('/'), function(linkname) {
					var uid = fileUid(linkname);
					zone.users.push(uid);
				}, function(err) {
					if ( err ) 
						return callback(err);
					if ( 0 === --c )
						callback(null, zones);
				});
			});
		})
	}
	
	/**
	 * Resolve references within the raw data store objects.
	 */
	function buildDataStore(store) {
		var groups = {}, users = {};
		store.groups.forEach(function(group) {
			groups[group.uid] = group;
		})
		store.users.forEach(function(user) {
			users[user.uid] = user;
		})
		
		// Fix up the groups to refer to Group records
		store.users.forEach(function(user) {
			var group = groups[user.primaryGroup];
			if ( group )
				user.primaryGroup = group;
			else
				console.warn(format("Primary group %s not found for user %s", user.primaryGroup, user.uid));
			user.groups = u.compact(u.map(u.uniq(user.groups||[]), function(gid) {
				var group = groups[gid];
				if ( !group )
					console.warn(format("Group %s not found for user %s", gid, user.uid));
				else {
					if ( !group.members )
						group.members = [];
					group.members.push(user);
				}
				return group;
			}));
		});
		
		store.zones.forEach(function(zone) {
			zone.users = u.compact(u.map(zone.users, function(uid) {
				return users[uid];
			}));
		});
		
		return store;
	}

	async.parallel([loadUsers, 
			loadGroups, 
			loadZones], 
			function(err, result) {
		if ( err ) 
			return callback(err);
		store = buildDataStore({
			dir: dir,
			users: result[0],
			groups: result[1],
			zones: result[2]
		});
		console.log(store);
		callback(null, store);
	});
}

/**
 * Initialize the data store from a specified directory.
 * 
 * @param callback
 *          invoked when ready
 */
function initialize(dir, callback) {
	if (store)
		return callback("data store is already initialized");

	var ready = false;
	chokidar.watch(dir, {
		ignored : /[\/\\]\./
	}).on('error', function(error) {
		console.log(format("Error watching %s : %s", dir, error))
	}).on('ready', function() {
		load(dir, function(err) {
			if (err)
				return callback(err);
			console.log("data store loaded");
			ready = true;
			callback(null);
		});
	}).on('all', function(event, path) {
		if ( !ready )
			return;
		console.log("data store changed: ", event, path);
		load(dir, function(err, result) {
			if (err)
				console.log(err);
			console.log("data store reloaded");
		});
	});
}

module.exports = {
	initialize : initialize,
	publicKeys : publicKeys,
	zonePassword : zonePassword,
	zoneUsers : zoneUsers,
	zoneGroups : zoneGroups,
}
