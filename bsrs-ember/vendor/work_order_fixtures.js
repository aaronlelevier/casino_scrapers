var BSRS_WORK_ORDER_FACTORY = (function() {
  var factory = function(workOrder, workOrderStatuses, currency, config) {
    this.workOrder = workOrder['default'].defaults();
    this.workOrderStatuses = workOrderStatuses['default'].defaults();
    this.currency = currency;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.workOrder.idOne;
    return {
      id: id,
      provider_name: this.workOrder.providerNameOne,
      provider_logo: this.workOrder.providerLogoOne,
      provider_address1: this.workOrder.providerAddress1One,
      provider_address2: this.workOrder.providerAddress2One,
      provider_city: this.workOrder.providerCityOne,
      provider_state: this.workOrder.providerStateOne,
      provider_postal_code: this.workOrder.providerPostalCodeOne,
      provider_phone: this.workOrder.providerPhoneOne,
      provider_email: this.workOrder.providerEmailOne,
      cost_estimate_currency: {
        id: this.currency.idOne,
        name: this.currency.name
      },
      cost_estimate: this.workOrder.costEstimateOne,
      scheduled_date: this.workOrder.scheduledDateOne,
      approval_date: this.workOrder.approvalDateOne,
      completed_date: this.workOrder.completedDateOne,
      expiration_date: this.workOrder.expirationDateOne,
      status: {id: this.workOrderStatuses.idOne, name: this.workOrderStatuses.nameFive}
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(work_order) {
    var id = work_order && workOrder.id || this.workOrder.idOne;
    var response = this.generate(id);
    response.cost_estimate_currency = response.cost_estimate_currency.id;
    for(var key in work_order) {
      response[key] = work_order[key];
    }
    return response;
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.workOrder.idOne.slice(0,-1)}${i}`,
      provider_name: `${this.workOrder.providerNameOne}${i}`,
      cost_estimate_currency: {
        id: `${this.workOrder.costEstimateOne.slice(0,-1)}${i}`,
        name: `${this.workOrder.name}${i}`,
      },
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var workOrder = require('./defaults/work-order');
  var workOrderStatuses = require('./defaults/work-order-status');
  var currency = require('./defaults/currency');
  var config = require('../config/environment');
  objectAssign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, config);
}
else {
  define('bsrs-ember/vendor/work_order_fixtures', ['exports', 'bsrs-ember/vendor/defaults/work-order', 'bsrs-ember/vendor/defaults/work-order-status', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, workOrder, workOrderStatuses, currency, mixin, config) {
      'use strict';
      Object.assign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
      return new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, config);
    }
  );
}
