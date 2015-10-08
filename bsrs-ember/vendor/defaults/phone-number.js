var phone_number_defaults = {idOne: '9435c17c-44eb-43be-9aa6-fd111a787b2a', idTwo: '820fd29e-8e95-4e6e-9986-01bf17f4269a', 
    idPut: 'b2b6757b-2b08-48be-8034-d144d2958ce7', numberOne: '858-715-5026', numberTwo: '858-715-5056', 
    idThree: 'beabb30a-6b18-4256-a1d1-4c661c24c08c', numberThree: '515-717-9876'};

if (typeof window === 'undefined') {
    module.exports = phone_number_defaults;
} else {
    define('bsrs-ember/vendor/defaults/phone-number', ['exports'], function (exports) {
        'use strict';
        return phone_number_defaults;
    });
}

