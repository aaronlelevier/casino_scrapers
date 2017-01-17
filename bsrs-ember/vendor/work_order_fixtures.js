var BSRS_WORK_ORDER_FACTORY = (function() {
  var factory = function(workOrder, workOrderStatuses, currency, provider_fixtures, people_fixtures, category_fixtures, config) {
    this.workOrder = workOrder['default'].defaults();
    this.workOrderStatuses = workOrderStatuses['default'].defaults();
    this.provider_fixtures = provider_fixtures.default || provider_fixtures;
    this.people_fixtures = people_fixtures.default || people_fixtures;
    this.currency = currency;
    this.category_fixtures = category_fixtures.default || category_fixtures;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.workOrder.idOne;
    return {
      id: id,
      cost_estimate_currency: this.currency.idOne,
      // needs a location id
      cost_estimate: this.workOrder.costEstimateOne,
      scheduled_date: this.workOrder.scheduledDateOne,
      approval_date: this.workOrder.approvalDateOne,
      approved_amount: this.workOrder.approvedAmount,
      completed_date: this.workOrder.completedDateOne,
      expiration_date: this.workOrder.expirationDateOne,
      tracking_number: this.workOrder.trackingNumberOne,
      instructions: this.workOrder.instructions,
      gl_code: this.workOrder.glCodeOne,
      status: {id: this.workOrderStatuses.idOne, name: this.workOrderStatuses.nameFive},
      category: this.category_fixtures.generate(),
      provider: this.provider_fixtures.generate(),
      approver: this.people_fixtures.get_names(),
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(work_order) {
    var id = work_order && work_order.id;
    var response = this.generate(id);
    response.category = response.category.id;
    response.status = response.status.id;
    response.provider = response.provider.id;
    response.approver = response.approver.id;
    delete response.tracking_number;
    for(var key in work_order) {
      response[key] = work_order[key];
    }
    return response;
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
  var people_fixtures = require('./people_fixtures');
  var category_fixtures = require('../vendor/category_fixtures');
  var config = require('../config/environment');
  objectAssign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, provider_fixtures, people_fixtures, category_fixtures, config);
}
else {
  define('bsrs-ember/vendor/work_order_fixtures', ['exports', 'bsrs-ember/vendor/defaults/work-order',
    'bsrs-ember/vendor/defaults/work-order-status', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/provider_fixtures', 'bsrs-ember/vendor/people_fixtures', 'bsrs-ember/vendor/category_fixtures',
    'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, workOrder, workOrderStatuses, currency, provider_fixtures, people_fixtures, category_fixtures, mixin, config) {
      'use strict';
      Object.assign(BSRS_WORK_ORDER_FACTORY.prototype, mixin.prototype);
      return new BSRS_WORK_ORDER_FACTORY(workOrder, workOrderStatuses, currency, provider_fixtures, people_fixtures, category_fixtures, config);
    }
  );
}
