var BSRS_AUTOMATION_ACTION_TYPE_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '64a4401d-bfc1-492a-9b58-aa2310a81da568',
      idTwo: '64a4401d-bfc1-492a-9b58-aa2310a81da636',
      idThree: '64a4401d-bfc1-492a-9b58-aa2310a81da634',
      idFour: '64a4401d-bfc1-492a-9b58-aa2310a81da635',
      idFive: '64a4401d-bfc1-492a-9b58-aa2310a81da639',
      idSix: '64a4401d-bfc1-492a-9b58-aa2310a81da640',
      idSeven: '64a4401d-bfc1-492a-9b58-aa2310a81da641',
      keyOne: 'automation.actions.ticket_assignee',
      keyOneTrans: 'Ticket: Assignee',
      keyTwo: 'automation.actions.ticket_priority',
      keyTwoTrans: 'Ticket: Priority',
      keyThree: 'automation.actions.ticket_status',
      keyThreeTrans: 'Ticket: Status',
      keyFour: 'automation.actions.send_email',
      keyFourTrans: 'Send Email',
      keyFive: 'automation.actions.send_sms',
      keyFiveTrans: 'Send Text Message',
      keySix: 'automation.actions.ticket_request',
      keySixTrans: 'Ticket: Request',
      keySeven: 'automation.actions.ticket_cc',
      keySevenTrans: 'Ticket: CC',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_AUTOMATION_ACTION_TYPE_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-action-type',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_AUTOMATION_ACTION_TYPE_DEFAULTS().defaults();
  });
}
