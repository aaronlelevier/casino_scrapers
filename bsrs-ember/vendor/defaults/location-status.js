var BSRS_LOC_STATUS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      openId: 'aca00958-987d-4576-aa4c-2093dc7d40f4',
      openName: 'admin.location.status.open',
      openNameTranslated: 'Open',
      closedId: 'aca00958-987d-4576-aa4c-2093dc7d40f5',
      closedName: 'admin.location.status.closed',
      closedNameTranslated: 'Closed',
      futureId: 'aca00958-987d-4576-aa4c-2093dc7d40f6',
      futureName: 'admin.location.status.future'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_LOC_STATUS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/location-status', ['exports'], function (exports) {
    'use strict';
    return new BSRS_LOC_STATUS_DEFAULTS_OBJECT().defaults();
  });
}
