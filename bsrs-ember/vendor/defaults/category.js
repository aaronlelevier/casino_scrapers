var BSRS_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function(currency_defaults) {
        this.currency = currency_defaults
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'ec62006b-6275-4aa9-abfa-38b146383d30',
            idTwo: 'ec62006b-6275-4aa9-abfa-38b146383d31',
            nameOne: 'Repair',
            nameTwo: 'Maintenance',
            nameThree: 'Loss Prevention', 
            status: 'Active',
            descriptionRepair: 'Interior and Exterior Store Report',
            descriptionMaintenance: 'Preventive Maintenance',
            costAmountOne: '10.00',
            costAmountTwo: '20.00',
            currency: this.currency.id,
            costCodeOne: '12584',
            costCodeTwo: '12585',
            labelOne: 'Type',
            labelOne: 'Trade',
            labelOne: 'Issue',
            subCatLabelOne: 'Trade',
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
