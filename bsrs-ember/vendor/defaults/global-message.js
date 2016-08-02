var BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      modal_unsaved_msg: 'You have unsaved changes. Are you sure?',
      category_power_select: '',
      assignee_power_select: 'power.select.select',
      cc_power_select: '',
      location_power_select: '',
      power_search: 'Type to search',
      no_results: 'No Matches',
      invalid_ph: 'Invalid Phone Number',
      invalid_email: 'Invalid Email',
      invalid_middle_initial: 'Invalid Middle Initial',
      invalid_username: 'Invalid Username',
      existing_username: 'admin.person.unique_username',
      invalid_password: 'Invalid Password',
      invalid_zip: 'Invalid Zip',
      invalid_street: 'Invalid Street Address',
      invalid_assignee: 'Assignee must be provided',
      invalid_location: 'Invalid Location',
      invalid_category: 'Invalid Category',
      invalid_status: 'Invalid Status',
      invalid_priority: 'Invalid Priority',
      dtd_empty_detail: 'admin.dtd.empty-detail',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/global-message', ['exports'], function (exports) {
    'use strict';
    return new BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT().defaults();
  });
}
