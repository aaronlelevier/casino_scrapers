var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level, setting) {
    this.location_level = location_level;
    this.setting = setting;
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
      namePut: 'Broom Pusher',
      locationLevelNameOne: this.location_level.nameCompany,
      locationLevelNameTwo: this.location_level.nameRegion,
      locationLevelOne: this.location_level.idOne,
      locationLevelTwo: this.location_level.idTwo,
      categories: [],
      unusedId: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3',
      settings: {
        dashboard_text:{
          value: null,
          inherited_value: 'Welcome',
          inherits_from: this.setting.name,
          inherits_from_id: this.setting.id
        },
        create_all: {
          value: this.setting.create_all,
        },
        accept_assign: {
          value: this.setting.accept_assign,
        },
        accept_notify: {
          value: this.setting.accept_notify,
        }
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var location_level = require('./location-level');
  var setting = require('./setting');
  module.exports = new BSRS_ROLE_DEFAULTS_OBJECT(location_level, setting).defaults();
} else {
  define('bsrs-ember/vendor/defaults/role',
    ['exports', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/defaults/setting'], function (exports, location_level, setting) {
    'use strict';
    return new BSRS_ROLE_DEFAULTS_OBJECT(location_level, setting).defaults();
  });
}
