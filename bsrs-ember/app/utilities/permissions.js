import { RESOURCES_WITH_PERMISSION, PERMISSION_PREFIXES } from 'bsrs-ember/utilities/constants';

export function eachPermission(fn) {
  RESOURCES_WITH_PERMISSION.forEach(function(resource) {
    PERMISSION_PREFIXES.forEach(function(prefix) {
      fn(resource, prefix);
    });
  });
}
