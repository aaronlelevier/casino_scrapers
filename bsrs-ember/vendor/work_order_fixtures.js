var BSRS_WORK_ORDER_FACTORY = (function() {
  var factory = function(workOrder, workOrderStatuses, currency, provider_fixtures, category_fixtures, config) {
    this.workOrder = workOrder['default'].defaults();
    this.workOrderStatuses = workOrderStatuses['default'].defaults();
    this.provider_fixtures = provider_fixtures.default || provider_fixtures;
    this.currency = currency;
    this.category_fixtures = category_fixtures.default || category_fixtures;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.workOrder.idOne;
    return {
      id: id,
      cost_estimate_currency: {
        id: this.currency.idOne,
        name: this.currency.name
      },
      // needs a location id
      cost_estimate: this.workOrder.costEstimateOne,
      scheduled_date: this.workOrder.scheduledDateOne,
      approval_date: this.workOrder.approvalDateOne,
      completed_date: this.workOrder.completedDateOne,
      expiration_date: this.workOrder.expirationDateOne,
      tracking_number: this.workOrder.trackingNumberOne,
      status: {id: this.workOrderStatuses.idOne, name: this.workOrderStatuses.nameFive},
      category: this.category_fixtures.generate(),
      provider: this.provider_fixtures.generate(),
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
  var provider_fixtures = require('./provider_fixtures');
  var category_fixtures = require('../vendor/category_fixtures');
  var config = require('../config/environment');
  objectAssign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, provider_fixtures, category_fixtures, config);
}
else {
  define('bsrs-ember/vendor/work_order_fixtures', ['exports', 'bsrs-ember/vendor/defaults/work-order', 
    'bsrs-ember/vendor/defaults/work-order-status', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/provider_fixtures', 'bsrs-ember/vendor/category_fixtures', 
    'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, workOrder, workOrderStatuses, currency, provider_fixtures, category_fixtures, mixin, config) {
      'use strict';
      Object.assign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
      return new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, provider_fixtures, category_fixtures, config);
    }
  );
}
