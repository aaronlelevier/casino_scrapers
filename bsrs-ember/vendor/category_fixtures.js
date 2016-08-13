var BSRS_CATEGORY_FACTORY = (function() {
  var factory = function(category_defaults, config) {
    this.category_defaults = category_defaults.default || category_defaults;
    this.config = config;
  };
  factory.prototype.get = function(i, name) {
    //right now function used for roles & tickets
    return {
      id: i || this.category_defaults.idOne,
      name: name || this.category_defaults.nameOne,
      status: this.category_defaults.status
    }
  };
  factory.prototype.get_list = function(i, name, children, parent, level) {
    var response = [{
      id: i || this.category_defaults.idOne,
      name: name || this.category_defaults.nameOne,
      children: children || [],
      parent_id: parent,
      level: level
    }];
    return {'count':1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.generate_for_power_select = function(i, name) {
    return {
      id: i || this.category_defaults.idOne,
      name: name || this.category_defaults.nameOne,
      label: this.category_defaults.labelOne,
      description: this.category_defaults.descriptionRepair
    }
  };
  factory.prototype.generate = function(i, name) {
    return {
      id: i || this.category_defaults.idOne,
      name: name || this.category_defaults.nameOne,
      description: this.category_defaults.descriptionRepair,
      cost_amount: this.category_defaults.costAmountOne,
      cost_currency: this.category_defaults.currency,
      cost_code: this.category_defaults.costCodeOne,
      label: this.category_defaults.labelOne,
      subcategory_label: this.category_defaults.subCatLabelOne,
    }
  },
  factory.prototype.children = function(id) {
    var _id = id || this.category_defaults.idChild;
    return [{id: _id, name: this.category_defaults.nameTwo, level: 1}];
  },
  factory.prototype.top_level = function() {
    var parent_one = this.get(this.category_defaults.idOne);
    parent_one.parent_id = null;
    var children = this.children(this.category_defaults.idTwo);
    children.push({id: this.category_defaults.idPlumbing});
    parent_one.children = children;
    parent_one.label = this.category_defaults.labelOne;
    parent_one.subcategory_label = this.category_defaults.subCatLabelOne;
    parent_one.level = 0;
    var parent_two = this.get(this.category_defaults.idThree, this.category_defaults.nameThree);
    parent_two.parent_id = null;
    parent_two.label = this.category_defaults.labelOne;
    parent_two.subcategory_label = this.category_defaults.subCatLabelOne;
    parent_two.level = 0;
    var response = [parent_one, parent_two];
    return {'count':2,'next':null,'previous':null,'results': response};
  },
  factory.prototype.top_level_role = function() {
    var parent_one = this.get(this.category_defaults.idOne);
    delete parent_one.status;
    // parent_one.parent_id = null;
    // parent_one.level = 0;
    var parent_two = this.get(this.category_defaults.idThree, this.category_defaults.nameThree);
    delete parent_two.status;
    // parent_two.parent_id = null;
    // parent_two.level = 0;
    var response = [parent_one, parent_two];
    return {'count':2,'next':null,'previous':null,'results': response};
  },
  factory.prototype.list = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d4';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else{
        uuid = uuid + i;
      }
      var category = this.generate(uuid);
      category.name += i;
      category.label += i;
      delete category.parent;
      response.push(category);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  },
  factory.prototype.list_two = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=page_size+1; i <= page_size*2-1; i++) {
      var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d4';
      var category = this.generate(uuid + i);
      category.name = 'cococat' + i;
      category.label = 'scohat' + i;
      response.push(category);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i) {
    var id = i || this.category_defaults.idOne;
    var category = this.generate(id);
    category.sub_category_label = this.category_defaults.subCatLabelOne;
    category.parent = this.category_defaults.parent;
    category.children = this.children();
    return category;
  };
  factory.prototype.put = function(category) {
    var response = this.generate(category.id)
    response.children = this.children();
    response.children = response.children.map(function(child) {
      return child.id ;
    });
    for (var key in category) {
      response[key] = category[key];
    }
    return response;
  };
  factory.prototype.list_power_select = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d4';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else {
        uuid = uuid + i;
      }
      var category = this.generate_for_power_select(uuid);
      category.name += i;
      category.label += i;
      response.push(category);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.list_power_select_id_name = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d4';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else {
        uuid = uuid + i;
      }
      var category = {id: uuid, name: 'foo'+i};
      response.push(category);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var category_defaults = require('./defaults/category');
  var config = require('../config/environment');
  objectAssign(BSRS_CATEGORY_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_CATEGORY_FACTORY(category_defaults, config);
} else {
  define('bsrs-ember/vendor/category_fixtures', ['exports', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, category_defaults, mixin, config) {
    'use strict';
    Object.assign(BSRS_CATEGORY_FACTORY.prototype, mixin.prototype);
    var Factory = new BSRS_CATEGORY_FACTORY(category_defaults, config);
    return {default: Factory};
  });
}
