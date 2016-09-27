var BSRS_PRIORITY_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'dfe28a24-307f-4da0-85e7-cdac016808c0',
      idTwo: '2a4c8c9c-7acb-44ca-af95-62a84e410e09',
      keyOne: 'ticket.priority.emergency',
      keyTwo: 'ticket.priority.high',
      priorityOneId: 'dfe28a24-307f-4da0-85e7-cdac016808c0',
      priorityOne: 'Emergency',
      priorityOneKey: 'ticket.priority.emergency',
      priorityTwoId: '2a4c8c9c-7acb-44ca-af95-62a84e410e09',
      priorityTwo: 'High',
      priorityTwoKey: 'ticket.priority.high',
      priorityThreeId: 'd7c1cc5c-eecd-49f0-bf46-c1ec489271ae',
      priorityThree: 'Medium',
      priorityThreeKey: 'ticket.priority.medium',
      priorityFourId: '7562051b-f5b7-40bf-a640-5c4cfb3a72a8',
      priorityFour: 'Low',
      priorityFourKey: 'ticket.priority.low'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_PRIORITY_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/ticket-priority', ['exports'], function (exports) {
    'use strict';
    return new BSRS_PRIORITY_DEFAULTS_OBJECT().defaults();
  });
}
