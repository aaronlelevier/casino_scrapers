var fooss = {id: 1};

if (typeof window === 'undefined') {
    module.exports = fooss;
} else {
    define('bsrs-ember/vendor/my_fixtures', ['exports'], function (exports) {
        'use strict';
        return fooss;
    });
}
