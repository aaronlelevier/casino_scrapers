import Ember from 'ember';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';

/**
 * @method hasPermission
 * @param {String} verb "add_"
 * @param {String} resource "locationlevel" - if "admin", then check all admin perms
 * @return {Boolean} returns true if string in array of permissions
 */

function adminPerms (perms) {
  if (perms.includes('view_person') && perms.includes('view_role') && perms.includes('view_category') && perms.includes('view_location') && perms.includes('view_locationlevel')) {
    return true;
  }
  return false;
}

export function hasPermission(params, { permissions: permissions, resource: resource, verb: verb }) {
  if (resource === 'admin') {
    return adminPerms(permissions);
  }

  if (resource && RESOURCES_WITH_PERMISSION.includes(resource)) {
    return permissions && permissions.includes(`${verb}_${resource.replace(/[-_]/g, '')}`);
  }
  return true;
}

export default Ember.Helper.helper(hasPermission);
