var BSRS_DTD_DEFAULTS_OBJECT = (function() { 
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '9435c17c-42eb-43be-9aa6-ed111a787b01', 
            idTwo: '9435c17c-42eb-43be-9aa6-ed111a787b02', 
            idThree: '9435c17c-42eb-43be-9aa6-ed111a787b03', 
            idPut: 'c2b6757b-2b08-48be-8034-d144d2958ce9', 
            keyOne: '1.1.1',
            keyTwo: '1.2.11',
            keySearchFiveOne: '1.2.15',
            keySearchFiveTwo: '1.1.5',
            keySearch14: '1.2.14',
            keyFullText: '1.1.3',
            descriptionOne: 'Please select an option below',
            descriptionTwo: 'You are done',
            promptOne: 'Did this solve the problem?',
            promptTwo: 'Do you need anything?',
            noteOne: 'Make sure to check the breakers',
            noteTwo: 'Good to go',
            noteTypeOne: 'admin.dtd.note_type.success',
            noteTypeTwo: 'admin.dtd.note_type.warning',
            linkTypeOne: 'admin.dtd.link_type.buttons',
            linkTypeTwo: 'admin.dtd.link_type.links',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_DTD_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/dtd', ['exports'], function (exports) {
        'use strict';
        return new BSRS_DTD_DEFAULTS_OBJECT().defaults();
    });
}

