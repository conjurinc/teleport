/**
 * Provides search functions over the data store, which is file-based.
 */

/**
 * Finds the public keys of a user in the data store. 
 * If the user is not found, the key list is +null+.
 * If the user is found, but has no public keys, the key list 
 * is an empty Array. Otherwise, it's an Array of the user's public keys.
 * 
 * Each key is guaranteed to span only one line, and to not end with a newline.
 * 
 * @callback error, public key list
 */
function publicKeys(uid, callback) {
	
}

/**
 * Provides the password for a zone. It's obtained from the pluggable secrets provider.
 * 
 * @callback error, String
 */
function zonePassword(zone, callback) {
	
}

/**
 * Provides the user list for a zone. 
 * 
 * @return an event emitter which emits 'user', 'error', and 'end' events.
 */
function zoneUsers(zone) {
	
}

/**
 * Provides the list of groups for a zone. The result is a list of 
 * every group that is held by at least one member of the zone.
 * The user list on each group is just those users with access to the zone.
 * 
 * @return an event emitter which emits 'group', 'error', and 'end' events.
 */
function zoneGroups(zone) {
	
}

module.exports = {
		zonePassword: zonePassword,
		zoneUsers: zoneUsers,
		zoneGroups: zoneGroups,
}
