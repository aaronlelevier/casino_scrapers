var BSRS_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function(currency_defaults) {
        this.currency = currency_defaults
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'ec62006b-6275-4aa9-abfa-38b146383d30',
            idTwo: 'ec62006b-6275-4aa9-abfa-38b146383d31',
            nameOne: 'admin.category.name.repair',
            nameTwo: 'admin.category.name.maintenance',
            nameThree: 'admin.category.name.loss_prevention', 
            status: 'admin.category.status.active',
            descriptionRepair: 'Interior and Exterior Store Repair',
            descriptionMaintenance: 'Preventive Maintenance',
            costAmountOne: '10.00',
            costAmountTwo: '20.00',
            currency: this.currency.id,
            costCodeOne: '12584',
            costCodeTwo: '12585',
            labelOne: 'admin.category.labelCat.type',
            labelTwo: 'admin.category.labelCat.trade',
            labelThree: 'admin.category.labelCat.issue',
            subCatLabelOne: 'Trade',
            subCatLabelTwo: 'Issue',
            parent: []
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var currency_defaults = require('./currencies'); 
    module.exports = new BSRS_CATEGORY_DEFAULTS_OBJECT(currency_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/category', ['exports', 'bsrs-ember/vendor/defaults/currencies'], function (exports, currency_defaults) {
        'use strict';
        return new BSRS_CATEGORY_DEFAULTS_OBJECT(currency_defaults).defaults();
    });
}
