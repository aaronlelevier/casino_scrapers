var BSRS_GENERAL_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            nameTicketAttachment: 'Invoice',
            attachmentIdOne: '249543cf-8fea-426a-8bc3-09778cd78011',
            attachmentIdTwo: '249543cf-8fea-426a-8bc3-09778cd78012',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_GENERAL_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/general', ['exports'], function (exports) {
        'use strict';
        return new BSRS_GENERAL_OBJECT().defaults();
    });
}

