var BSRS_PEOPLE_FACTORY = (function() {
  var factory = function(email_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, location_fixtures, location_defaults, locale_defaults, config) {
    this.emails = email_fixtures;
    // this.address_fixtures = address_fixtures;
    this.person_defaults = person_defaults['default'].defaults();
    this.phone_number_fixtures = phone_number_fixtures;
    this.location_fixtures = location_fixtures.default || location_fixtures;
    this.role_defaults = role_defaults;
    this.status_defaults = status_defaults;
    this.location_level_defaults = location_level_defaults;
    this.location_defaults = location_defaults;
    this.locale_defaults = locale_defaults;
    this.config = config;
  };
  factory.prototype.get = function(i, first_name, last_name) {
    //right now function used for tickets - needed as role and status for ticket detail
    var first_name = first_name || this.person_defaults.first_name;
    var last_name = last_name || this.person_defaults.last_name;
    var fullname = first_name + ' ' + last_name;
    return {
      id: i || this.person_defaults.id,
      first_name: first_name,
      last_name: last_name,
      fullname: fullname,
      role: this.person_defaults.role,
      status: this.person_defaults.status
    }
  };
  factory.prototype.get_no_related = function(i, first_name, last_name) {
    /* power select and ticket assignee */
    var first_name = first_name || this.person_defaults.first_name;
    var last_name = last_name || this.person_defaults.last_name;
    var fullname = first_name + ' ' + last_name;
    /* @return {array} */
    return {
      id: i || this.person_defaults.id,
      first_name: first_name,
      last_name: last_name,
      fullname: fullname,
      photo: {id: '80f530c4-ce6c-4724-9cfd-47y16e38900' + i, image_thumbnail: 'http://www.femalefirst.co.uk/image-library/square/250/m/xmel-gibson-awi.jpg.pagespeed.ic.6BxCJhF4Ru.jpg'},
    }
  };
  factory.prototype.get_for_power_select = function(i, first_name, last_name) {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    response = [this.get_no_related(i, first_name, last_name)];
    return {count:page_size*2-2, next:null, previous:null, results:response};
  };
  factory.prototype.generate_list = function(i) {
    return {
      id: i,
      username : this.person_defaults.username,
      first_name : this.person_defaults.first_name,
      middle_initial : this.person_defaults.middle_initial,
      last_name : this.person_defaults.last_name,
      title : this.person_defaults.title,
      status : {id: this.status_defaults.activeId, name: this.status_defaults.activeName},
      role: this.role_defaults.idOne,
      photo: {id: '80f530c4-ce6c-4724-9cfd-47y16e38900' + i, image_thumbnail: 'http://www.femalefirst.co.uk/image-library/square/250/m/xmel-gibson-awi.jpg.pagespeed.ic.6BxCJhF4Ru.jpg'},
    }
  };
  factory.prototype.generate = function(i) {
    return {
      id: i,
      username : this.person_defaults.username,
      first_name : this.person_defaults.first_name,
      middle_initial : this.person_defaults.middle_initial,
      last_name : this.person_defaults.last_name,
      title : this.person_defaults.title,
      employee_id : this.person_defaults.employee_id,
      status_fk : this.status_defaults.activeId,
      role: this.role_defaults.idOne,
      locations: [],
      emails: [],
      phone_numbers: [],
      locale: this.locale_defaults.idOne,
      photo: {id: '80f530c4-ce6c-4724-9cfd-47y16e389007', image_full: 'http://www.femalefirst.co.uk/image-library/square/250/m/xmel-gibson-awi.jpg.pagespeed.ic.6BxCJhF4Ru.jpg', image_medium: 'http://www.femalefirst.co.uk/image-library/square/250/m/xmel-gibson-awi.jpg.pagespeed.ic.6BxCJhF4Ru.jpg', image_thumbnail: 'http://www.femalefirst.co.uk/image-library/square/250/m/xmel-gibson-awi.jpg.pagespeed.ic.6BxCJhF4Ru.jpg'},
    }
  };
  factory.prototype.list = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
      if (i < 25) {
        uuid = uuid + '0' + i;
      } else {
        uuid = uuid + i;
      }
      var person = this.generate_list(uuid);
      //TODO: DRY this up
      person.username = 'mgibson' + i;
      person.first_name = 'Mel' + i;
      person.last_name = 'Gibson' + i;
      person.fullname = person.first_name + ' ' + person.last_name;
      person.title = i + ' MVP';
      response.push(person);
    }
    return {count:page_size*2-2,next:null,previous:null,results: response};
  };
  factory.prototype.list_two = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=page_size+1; i <= page_size*2-2; i++) {
      var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
      var person = this.generate_list(uuid + i);
      person.role = this.role_defaults.idTwo;
      delete person.locations;
      delete person.locale;
      delete person.emails;
      delete person.phone_numbers;
      person.username = 'scott' + i;
      person.first_name = 'Scott' + i;
      person.last_name = 'Newcomer' + i;
      person.title = i + ' WAT';
      person.status = {id: this.status_defaults.inactiveId, name: this.status_defaults.inactiveName};
      response.push(person);
    }
    return {'count':page_size*2-2,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i, username) {
    var j = i || this.person_defaults.idOne;
    var person = this.generate(j);
    var current_username = person.username;
    person.username = username || current_username;
    person.acceptassign = false;
    person.emails = this.emails.get();
    person.phone_numbers = this.phone_number_fixtures.get();
    person.locations = [this.location_fixtures.get_fk()];
    person.inherited = this.person_defaults.inherited;
    return person;
  };
  factory.prototype.put = function(person) {
    var response = this.generate(person.id);
    delete response.status_fk;
    response.emails = this.emails.put();
    response.phone_numbers = this.phone_number_fixtures.put();
    response.status = this.status_defaults.activeId;
    response.role = this.role_defaults.idOne;
    response.locale = this.person_defaults.locale_id;
    response.locations = [this.location_defaults.idOne];
    response.auth_currency = response.auth_currency;
    response.photo = response.photo.id;
    for(var key in person) {
      response[key] = person[key];
    }
    response.auth_amount = response.auth_amount || null;
    return response;
  };
  factory.prototype.search = function() {
    var response = [];
    for (var i=1; i <= 10; i++) {
      var uuid = '249543cf-8fea-426a-8bc3-09778cd780';
      if (i < 10) {
        uuid = uuid + '0' + i;
      } else{
        uuid = uuid + i;
      }
      var person = this.generate(uuid);
      delete person.locations;
      delete person.locale;
      delete person.phone_numbers;
      // delete person.addresses;
      person.username = 'boy' + i;
      person.first_name = 'Boy' + i;
      person.last_name = 'Man' + i;
      person.fullname = person.first_name + ' ' + person.last_name;
      person.title = i + ' Mob Boss';
      response.push(person);
    }
    //we do a reverse order sort here to verify a real sort occurs in the component
    var sorted = response.sort(function(a,b) {
      return b.id - a.id;
    });
    return {'count':10,'next':null,'previous':null,'results': sorted};
  };
  factory.prototype.search_power_select = function() {
    var response = [];
    for (var i=1; i <= 10; i++) {
      var uuid = '249543cf-8fea-426a-8bc3-09778cd780';
      if (i < 10) {
        uuid = uuid + '0' + i;
      } else{
        uuid = uuid + i;
      }
      // only want username, fullname, title
      var person = this.get_no_related(uuid);
      person.username = 'boy' + i;
      person.first_name = 'Boy' + i;
      person.last_name = 'Man' + i;
      person.fullname = person.first_name + ' ' + person.last_name;
      person.title = i + ' Mob Boss';
      response.push(person);
    }
    return {count:10,next:null,previous:null,results: response};
  };
  factory.prototype.sms_power_select = function() {
    const response = this.search_power_select();
    const new_results = response.results.map(function(person) {
      person['type'] = 'person';
      return person;
    });
    return {count:10,next:null,previous:null,results: new_results};
  };

  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var email_fixtures = require('../vendor/email_fixtures');
  // var address_fixtures = require('../vendor/address_fixtures');
  var phone_number_fixtures = require('../vendor/phone_number_fixtures');
  var person_defaults = require('../vendor/defaults/person');
  var role_defaults = require('../vendor/defaults/role');
  var status_defaults = require('../vendor/defaults/status');
  var location_level_defaults = require('../vendor/defaults/location-level');
  var location_defaults = require('../vendor/defaults/location');
  var location_fixtures = require('../vendor/location_fixtures');
  var locale_defaults = require('../vendor/defaults/locale');
  var config = require('../config/environment');
  objectAssign(BSRS_PEOPLE_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_PEOPLE_FACTORY(email_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, location_fixtures, location_defaults, locale_defaults, config);
} else {
  define('bsrs-ember/vendor/people_fixtures', [
    'exports',
    'bsrs-ember/vendor/email_fixtures',
    'bsrs-ember/vendor/phone_number_fixtures',
    'bsrs-ember/vendor/defaults/person',
    'bsrs-ember/vendor/defaults/role',
    'bsrs-ember/vendor/defaults/status',
    'bsrs-ember/vendor/defaults/location-level',
    'bsrs-ember/vendor/location_fixtures',
    'bsrs-ember/vendor/defaults/location',
    'bsrs-ember/vendor/defaults/locale',
    'bsrs-ember/vendor/mixin',
    'bsrs-ember/config/environment'
  ], function (
    exports,
    email_fixtures,
    phone_number_fixtures,
    person_defaults,
    role_defaults,
    status_defaults,
    location_level_defaults,
    location_fixtures,
    location_defaults,
    locale_defaults,
    mixin,
    config
  ) {
    'use strict';
    Object.assign(BSRS_PEOPLE_FACTORY.prototype, mixin.prototype);
    let people = new BSRS_PEOPLE_FACTORY(email_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, location_fixtures, location_defaults, locale_defaults, config);
    exports.default = people;
  });
}
