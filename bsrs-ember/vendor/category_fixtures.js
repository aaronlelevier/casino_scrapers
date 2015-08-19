var BSRS_CATEGORY_FACTORY = (function() {
    var factory = function(category_defaults) {
        this.category_defaults = category_defaults
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.category_defaults.nameOne,
            description: this.category_defaults.descriptionRepair,
            cost_amount: this.category_defaults.costAmountOne,
            cost_currency: this.category_defaults.currency,
            cost_code: this.category_defaults.costCodeOne,
            label: this.category_defaults.labelOne
        }
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=0; i < 23; i++) {
            var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d3';
            response.push(this.generate(uuid + i));
        }
        return {'count':23,'next':null,'previous':null,'results': response};
    },
    factory.prototype.detail = function(i) {
        var category = this.generate(i);
        category.sub_category_label = this.category_defaults.subCatLabelOne;
        category.parent = this.category_defaults.parent;
        return category;
    },
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(category) {
        var response = this.generate(category.id)
        for (var key in category) {
            response[key] = category[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var category_defaults = require('./defaults/category');
    module.exports = new BSRS_CATEGORY_FACTORY(category_defaults);
} else {
    define('bsrs-ember/vendor/category_fixtures', ['exports', 'bsrs-ember/vendor/defaults/category'], function (exports, category_defaults) {
        'use strict';
        return new BSRS_CATEGORY_FACTORY(category_defaults);
    });
}

