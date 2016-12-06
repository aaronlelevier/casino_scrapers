import Ember from 'ember';

export function getPermission(params/*, hash*/) {
  const permissionItem = params[0];
  const prefix = params[1];
  return `permissions_${prefix}_${permissionItem}`;
}

export default Ember.Helper.helper(getPermission);
