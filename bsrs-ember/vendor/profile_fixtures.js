var BSRS_PROFILE_FACTORY = (function() {
  var factory = function(profile) {
    this.profile = profile;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.profile.idOne;
    return {
      id: id,
      description: this.profile.descOne,
      assignee_id: this.profile.assigneeOne,
    };
  };
  factory.prototype.detail = function() {
    return this.generate();
  };
  factory.prototype.put = function(id) {
    return this.generate();
  };
  factory.prototype.list = function(id) {
    let results = [];
    let response = {results: results};
    for(var i = 0; i < 10; i++) {
      results.push({
        id: `${this.profile.idOne.slice(0,-1)}${i}`,
        description: `${this.profile.descOne}${i}`,
        assignee: {
          id: `${this.profile.assigneeOne.slice(0,-1)}${i}`,
          username: `${this.profile.username}${i}`,
        },
      });
    }
    return response;
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var profile = require('./defaults/profile');
  module.exports = new BSRS_PROFILE_FACTORY(profile);
}
else {
  define('bsrs-ember/vendor/profile_fixtures', ['exports', 'bsrs-ember/vendor/defaults/profile'],
    function(exports, profile) {
      'use strict';
      return new BSRS_PROFILE_FACTORY(profile);
    }
  );
}