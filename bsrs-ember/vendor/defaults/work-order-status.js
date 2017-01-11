var BSRS_WO_STATUS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '4ab9b1fb-c624-4214-bb4c-16567b3d37e6',
      idTwo: 'efa1f64f-d0d7-4915-be85-54b8c38d3aeb',
      nameFive: 'work_order.status.new',
      nameOne: 'work_order.status.declined',
      nameTwo: 'work_order.status.dispatch_confirmed',
      nameThree: 'work_order.status.onsite',
      nameFour: 'work_order.status.confirmed',
      nameSix: 'work_order.status.parts_on_order',
      nameSeven: 'work_order.status.proposal_approved',
      nameEight: 'work_order.status.waiting_for_approval',
      nameNine: 'work_order.status.waiting_for_quote',
      nameTen: 'work_order.status.cancelled',
      nameEleven: 'work_order.status.no_charge',
      nameTwelve: 'work_order.status.pending_confirmation',
      nameThirteen: 'work_order.status.unsatisfactory',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports['default'] = new BSRS_WO_STATUS_DEFAULTS_OBJECT();
} else {
  define('bsrs-ember/vendor/defaults/work-order-status', ['exports'], function (exports) {
    'use strict';
    var wo = new BSRS_WO_STATUS_DEFAULTS_OBJECT();
    exports.default = wo;
  });
}
