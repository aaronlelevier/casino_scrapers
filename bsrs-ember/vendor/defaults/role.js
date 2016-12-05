/*global require, module, define*/
var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level, currency, tenant, constants) {
    this.location_level = location_level;
    this.currency = currency;
    this.tenant = tenant;
    this.constants = constants;
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'af34ee9b-833c-4f3e-a584-b6851d1e04b1',
      idTwo: 'af34ee9b-833c-4f3e-a584-b6851d1e04b2',
      idGridOne: 'af34ee9b-833c-4f3e-a584-b6851d1e0404',
      idGridTen: 'af34ee9b-833c-4f3e-a584-b6851d1e04017',
      roleTypeContractor: 'Third Party',
      t_roleTypeContractor: 'admin.role.type.third_party',
      roleTypeGeneral: 'Internal',
      t_roleTypeGeneral: 'admin.role.type.internal',
      nameOne: 'System Administrator',
      nameTwo: 'District Manager',
      nameContractor: 'Contractor',
      nameCoordinator: 'Coordinator',
      nameThree: 'Manager',
      nameGrid: 'zap4',
      nameGridTen: 'zap10',
      nameGridXav: 'xav14',
      nameLastPage2Grid: 'xav19',
      namePut: 'Broom Pusher',
      locationLevelNameOne: this.location_level.nameCompany,
      locationLevelNameTwo: this.location_level.nameRegion,
      locationLevelOne: this.location_level.idOne,
      locationLevelTwo: this.location_level.idTwo,
      categories: [],
      unusedId: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3',
      dashboard_text: 'Hi',
      dashboard_textTwo: 'Bueno',
      auth_amount: this.currency.authAmountOne,
      auth_currency: this.currency.id,
      inherited: {
        dashboard_text: {
          value: null,
          inherited_value: 'Welcome',
          inherits_from: this.tenant.inherits_from_tenant,
          inherits_from_id: this.tenant.id
        },
        auth_currency: {
          value: null,
          inherited_value: this.currency.id,
          inherits_from: this.tenant.inherits_from_tenant,
          inherits_from_id: this.tenant.id
        }
      },
      permissions: defaultPerms(
        this.constants.RESOURCES_WITH_PERMISSION,
        this.constants.PERMISSION_PREFIXES
      )
    };
  };
  return factory;
})();

function defaultPerms(resources, prefixes) {
  let perms = {};
  resources.forEach(function(resource) {
    prefixes.forEach(function(prefix) {
      var key = prefix + '_' + resource;
      perms[key] = (prefix === 'delete') ? false : true;
    });
  });
  return perms;
}

if (typeof window === 'undefined') {
  var location_level = require('./location-level');
  var currency = require('./currency');
  var tenant = require('./tenant');
  var constants = require('./constants');
  module.exports = new BSRS_ROLE_DEFAULTS_OBJECT(location_level, currency, tenant, constants).defaults();
} else {
  define('bsrs-ember/vendor/defaults/role',
    ['exports',
    'bsrs-ember/vendor/defaults/location-level',
    'bsrs-ember/vendor/defaults/currency',
    'bsrs-ember/vendor/defaults/tenant',
    'bsrs-ember/utilities/constants'],
    function (exports, location_level, currency, tenant, constants) {
    'use strict';
    return new BSRS_ROLE_DEFAULTS_OBJECT(location_level, currency, tenant, constants).defaults();
  });
}
