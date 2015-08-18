var BSRS_CATEGORY_FACTORY = (function() {
    var factory = function(category_defaults) {
        this.category_defaults = category_defaults
    };
    // factory.prototype.get = function() {
    //     return [{
    //         'id':this.id,
    //         'name':this.name, 
    //         // 'status':{
    //         //     'id': this.category_type_defaults.officeType,
    //         //     'name': this.category_type_defaults.officeName
    //         // }
    //     },
    //     {
    //         'id':this.idTwo,
    //         'name':this.nameTwo,
    //         // 'status':{
    //         //     'id':this.category_type_defaults.mobileType,
    //         //     'name': this.category_type_defaults.mobileName
    //         // }
    //     }];
    // };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.category_defaults.nameOne,
            description: this.category_defaults.descriptionRepair,
            cost_amount: this.category_defaults.costAmountOne,
            cost_currency: this.category_defaults.currency,
            cost_code: this.category_defaults.costCodeOne
        }
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            var uuid = 'bd5c471a-518b-4333-bcbd-b46672b24c74';
            response.push(this.generate(uuid + i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    },
    factory.prototype.detail = function(i) {
        var category = this.generate(i);
        category.label = this.category_defaults.labelOne;
        category.sub_category_label = this.category_defaults.subCatLabelOne;
        category.parent = this.category_defaults.parent;
    },
    factory.prototype.put = function(category) {
        var categories = [
            {id: this.id, name: this.name}, {id: this.idTwo, name: this.nameTwo}
        ];
        if(!category) {
            return categories;
        }
        categories.forEach(function(model) {
            if(model.id === category.id) {
                for (var attr in category) {
                    model[attr] = category[attr];
                }
            }
        });
        return categories;
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

