import Ember from 'ember';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';

/**
 * if meet admin criteria by checking all admin resources
 * @function hasPermission
 */
function adminPerms(perms, verb) {
  if (perms.includes(`${verb}_person`) && perms.includes(`${verb}_role`) && perms.includes(`${verb}_category`) && 
    perms.includes(`${verb}_location`) && perms.includes(`${verb}_locationlevel`)) {
      return true;
    }
  return false;
}

/**
 * @method hasPermission
 * @param {Array} permissions - can be undefined b/c
 * @param {String} verb "add_"
 * @param {String} resource "locationlevel" - if "admin", then check all admin perms
 * @return {Boolean} returns true if string in array of permissions
 */
const map = Object.create(null);

export function hasPermission(_params, { permissions: permissions = [], resource: resource, verb: verb }) {
  // convert to string and if permissions change, then array will contain a diff string with opposite bool
  const key = permissions.sort().join('') + verb + resource;
  if (key && map[key]) {
    return map[key];
  } else {
    if (resource !== 'admin' && !RESOURCES_WITH_PERMISSION.includes(resource)) {
      return map[key] = true;
    }
    // Gear icon on dashboard to go to admin section
    if (resource === 'admin') {
      return map[key] = adminPerms(permissions, verb);
    } else if (resource) {
      // Regex to swap out something like location-level noun to locationlevel as expected by backend
      return map[key] = permissions.includes(`${verb}_${resource.replace(/[-_]/g, '')}`);
    }
  }
}

export default Ember.Helper.helper(hasPermission);
