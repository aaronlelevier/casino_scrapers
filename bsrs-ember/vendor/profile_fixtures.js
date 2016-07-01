var BSRS_PROFILE_FACTORY = (function() {
    var factory = function(profile) {
        this.profile = profile;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.profile.idOne;
        return {
            id: id,
            description: this.profile.descOne,
            order: this.profile.orderOne,
            assignee_id: this.profile.assigneeOne,
        };
    };
    factory.prototype.detail = function() {
        return this.generate();
    };
    factory.prototype.put = function(id) {
        return this.generate();
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var profile = require('./defaults/profile');
    module.exports = new BSRS_PROFILE_FACTORY(profile);
} else {
    define('bsrs-ember/vendor/profile_fixtures',
        ['exports', 'bsrs-ember/vendor/defaults/profile'],
        function (exports, profile) {
            'use strict';
            return new BSRS_PROFILE_FACTORY(profile);
        }
    );
}
