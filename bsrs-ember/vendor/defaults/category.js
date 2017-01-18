const COST_AMOUNT_ONE = '10.00';
const ID_ONE = 'ec62006b-6275-4aa9-abfa-38b146383d301';

var BSRS_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function(currency_defaults) {
        this.currency = currency_defaults
    };
    factory.prototype.defaults = function() {
        return {
            idOne: ID_ONE,
            idTwo: 'ec62006b-6275-4aa9-abfa-38b146383d302',
            idThree: 'ec62006b-6275-4aa9-abfa-38b146383d303',
            idChild: 'ec62006b-6275-4aa9-abfa-38b146383d304',//used for outlet right now
            idGridOne: 'ec62006b-6275-4aa9-abfa-38b146383d401',
            idSelected: 'ec62006b-6275-4aa9-abfa-38b146383d403',
            idWatChild: 'ec62006b-6275-4aa9-abfa-38b146383d306',
            idParent: 'ec62006b-6275-4aa9-abfa-38b146383d305',
            idPlumbing: 'ec62006b-6275-4aa9-abfa-38b146383d306',
            idPlumbingChild: 'ec62006b-6275-4aa9-abfa-38b146383d307',
            idLossPreventionChild: 'ec62006b-6275-4aa9-abfa-38b146383d308',
            idSolo: 'ec62006b-6275-4aa9-abfa-38b146383d309',
            nameSolo: 'Repair',
            nameRepairKey: 'admin.category.name.repair',
            unusedId: 'ec62006b-6275-4aa9-abfa-38b146383d50',
            nameOne: 'Repair',
            nameTwo: 'Electrical',
            nameThree: 'Loss Prevention',
            nameRepairChild: 'Plumbing',
            namePlumbingChild: 'Toilet Leak',
            nameLossPreventionChild: 'Security',
            nameElectricalChild: 'Outlet',
            nameUnused: 'wat',
            nameWatChild: 'scott',
            idNew: 'abc123',
            status: 'admin.category.status.active',
            descriptionRepair: 'Interior and Exterior Store Repair',
            descriptionMaintenance: 'Preventive Maintenance',
            costAmountOne: COST_AMOUNT_ONE,
            costAmountTwo: '20.00',
            currency: this.currency.id,
            costCodeOne: '12584',
            costCodeTwo: '12585',
            labelOne: 'Type',
            labelTwo: 'Trade',
            labelThree: 'Issue',
            subCatLabelOne: 'Trade',
            subCatLabelTwo: 'Issue',
            parent: [],
            statusOne: 'admin.category.status.active',
            statusTwo: 'admin.category.status.inactive',
            nameRandom: 'x',
            idRandom: 'ec62006b-6275-4aa9-abfa-38b146383z213',
            inherited: {
                proxy_cost_amount: {
                    value: null,
                    inherited_value: COST_AMOUNT_ONE,
                    inherits_from: 'category',
                    inherits_from_id: ID_ONE
                }
            }
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var currency_defaults = require('./currency');
    module.exports = new BSRS_CATEGORY_DEFAULTS_OBJECT(currency_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/category', ['exports', 'bsrs-ember/vendor/defaults/currency'], function (exports, currency_defaults) {
        'use strict';
        return new BSRS_CATEGORY_DEFAULTS_OBJECT(currency_defaults).defaults();
    });
}
