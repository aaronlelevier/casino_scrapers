var BSRS_CATEGORY_FACTORY = (function() {
    var factory = function(category_defaults) {
        this.id = category_defaults.id;
        this.idTwo = category_defaults.idTwo;
        this.name = category_defaults.name;
        this.nameTwo = category_defaults.nameTwo;
    };
    factory.prototype.get = function() {
        return [{
            'id':this.id,
            'name':this.name, 
            // 'status':{
            //     'id': this.category_type_defaults.officeType,
            //     'name': this.category_type_defaults.officeName
            // }
        },
        {
            'id':this.idTwo,
            'name':this.nameTwo,
            // 'status':{
            //     'id':this.category_type_defaults.mobileType,
            //     'name': this.category_type_defaults.mobileName
            // }
        }];
    };
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

