import Ember from 'ember';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';

/**
 * @method hasPermission
 * @param {String} verb "add_"
 * @param {String} resource "locationlevel" - if "admin", then check all admin perms
 * @return {Boolean} returns true if string in array of permissions
 */

function adminPerms(perms, verb) {
  if (perms.includes(`${verb}_person`) && perms.includes(`${verb}_role`) && perms.includes(`${verb}_category`) && 
    perms.includes(`${verb}_location`) && perms.includes(`${verb}_locationlevel`)) {
    return true;
  }
  return false;
}

export function hasPermission(_params, { permissions: permissions, resource: resource, verb: verb }) {
  if (resource === 'admin') {
    return adminPerms(permissions, verb);
  }

  if (resource && RESOURCES_WITH_PERMISSION.includes(resource)) {
    return permissions && permissions.includes(`${verb}_${resource.replace(/[-_]/g, '')}`);
  }
  return true;
}

export default Ember.Helper.helper(hasPermission);
