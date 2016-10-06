var BSRS_EMAIL_FACTORY = (function() {
  var factory = function(email, email_type) {
    this.email_type = email_type;
    this.email = email;
  };
  factory.prototype.get = function() {
    return [{
      id: this.email.idOne,
      email: this.email.emailOne,
      type: this.email_type.idOne,
    }, {
      id: this.email.idTwo,
      email: this.email.emailTwo,
      type: this.email_type.idTwo,
    }];
  };
  factory.prototype.get_belongs_to = function(id) {
    return {
      id: id || this.email.idOne,
      email: this.email.emailOne,
      type: this.email_type.workId,
    };
  };
  factory.prototype.get_with_related_ids = function() {
    return [{
      id: this.email.idOne,
      email: this.email.emailOne,
      type: this.email_type.idOne
    }, {
      id: this.email.idTwo,
      email: this.email.emailTwo,
      type: this.email_type.idTwo
    }];
  };
  factory.prototype.put = function(email) {
    var emails = this.get_with_related_ids();
    if (!email) {
      return emails;
    }
    emails.forEach(function(model) {
      if (model.id === email.id) {
        for (var attr in email) {
          model[attr] = email[attr];
        }
      }
    });
    return emails;
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var email = require('./defaults/email');
  var email_type = require('./defaults/email-type');
  module.exports = new BSRS_EMAIL_FACTORY(email, email_type);
}
else {
  define('bsrs-ember/vendor/email_fixtures', ['exports', 'bsrs-ember/vendor/defaults/email', 'bsrs-ember/vendor/defaults/email-type'],
    function(exports, email, email_type) {
      'use strict';
      return new BSRS_EMAIL_FACTORY(email, email_type);
    });
}
