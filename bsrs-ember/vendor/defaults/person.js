const BSRS_PERSON_ID = '139543cf-8fea-426a-8bc3-09778cd79901';
const BSRS_PERSON_ORIG_USERNAME = 'mgibson';
const BSRS_PERSON_SORTED_USERNAME = 'wanker';
const BSRS_PERSON_USERNAME = BSRS_PERSON_ORIG_USERNAME + '1';
const BSRS_PERSON_PASSWORD = 'Wanker1';
const BSRS_PERSON_EMAIL = [];
const BSRS_PERSON_ORIG_FIRST_NAME = 'Mel';
const BSRS_PERSON_FIRST_NAME = BSRS_PERSON_ORIG_FIRST_NAME + '1';
const BSRS_PERSON_MIDDLE_INITIAL = 'B';
const BSRS_PERSON_ORIG_LAST_NAME = 'Gibson';
const BSRS_PERSON_LAST_NAME = BSRS_PERSON_ORIG_LAST_NAME + '1';
const BSRS_PERSON_employee_id = '5063';
const BSRS_PERSON_AUTH_AMOUNT = 50000.0000;
const BSRS_PERSON_ORIG_TITLE = 'MVP';
const BSRS_PERSON_TITLE = '1 ' + BSRS_PERSON_ORIG_TITLE;
const BSRS_PERSON_LOCATION = '';
const BSRS_PERSON_PHONE_NUMBERS = [];
const BSRS_PERSON_ADDRESSES = [];
const BSRS_PERSON_UNUSED_ID = 'cadba3ba-a533-44e0-ab1f-57cc1b052138';

var BSRS_PERSON_DEFAULTS_OBJECT = (function() {
  var factory = function(role_defaults, status_defaults, currency_defaults, locale_defaults) {
    this.role_defaults = role_defaults;
    this.status_defaults = status_defaults;
    this.currency_defaults = currency_defaults;
    this.locale_defaults = locale_defaults;
  };
  factory.prototype.defaults = function() {
    return {
      id: BSRS_PERSON_ID,
      idOne: BSRS_PERSON_ID,
      idTwo: '8b881d03-ac0b-4e4c-9d30-8a1d3d7d0783',
      idThree: '8b881d03-ac0b-4e4c-9d30-8a1d3d7d0784',
      idBoy: '249543cf-8fea-426a-8bc3-09778cd78001',
      idDonald: 'b783a238-5631-4623-8d24-81a672bb4ea0',
      idSearch: '249543cf-8fea-426a-8bc3-09778cd78002',
      username: BSRS_PERSON_USERNAME,
      password: BSRS_PERSON_PASSWORD,
      emails: BSRS_PERSON_EMAIL,
      first_name: BSRS_PERSON_FIRST_NAME,
      middle_initial: BSRS_PERSON_MIDDLE_INITIAL,
      last_name: BSRS_PERSON_LAST_NAME,
      fullname: BSRS_PERSON_FIRST_NAME + ' ' + BSRS_PERSON_LAST_NAME,
      role: this.role_defaults.idOne,
      status: this.status_defaults.activeId,
      statusInactive: this.status_defaults.inactiveId,
      phone_numbers: BSRS_PERSON_PHONE_NUMBERS,
      // addresses: BSRS_PERSON_ADDRESSES,
      location: BSRS_PERSON_LOCATION,
      employee_id: BSRS_PERSON_employee_id,
      title: BSRS_PERSON_TITLE,
      auth_amount: BSRS_PERSON_AUTH_AMOUNT,
      auth_currency: this.currency_defaults.id,
      locale: 'en',
      localeFull: this.locale_defaults.nameOne, // 'English - English',
      locale2: 'es',
      localeTwoFull: this.locale_defaults.nameTwo, // 'Spanish - Español',
      localeTwo: 'Spanish',
      locale_id: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
      locale2_id: '51905ba8-024f-4739-ae5c-2d90ffc3f726',
      unusedId: BSRS_PERSON_UNUSED_ID,
      anotherId: '8aef1a27-f1c5-4721-83c0-9f1fceabd263',
      sorted_username: BSRS_PERSON_SORTED_USERNAME,

      scott_username: 'scott11',
      donald_first_name: 'Donald',
      donald_middle_initial: 'D',
      donald_last_name: 'Trump',
      donald_employee_id: '666',
      donald: 'Donald Trump',
      nameOne: 'wanker',
      nameTwo: 'bonker',
      nameThree: 'tommy',
      nameMel: 'Mel1 Gibson1',
      nameBoy: 'Boy1',
      nameBoy2: 'Boy2',
      fullnameBoy: 'Boy1 Man1',
      fullnameBoy2: 'Boy2 Man2',
      lastNameOne: 'A',
      lastNameTwo: 'B',
      lastNameThree: 'C',
      lastNameBoy: 'Man1',
      lastNameBoy2: 'Man2',
      usernameLastPage2Grid: 'scott17',
      fullnameLastPage2Grid: 'Scott17 Newcomer17',
      titleLastPage2Grid: 'Scott17 Newcomer17',
      titleOne: 'Pres',
      titleTwo: 'Vice Pres',
      titleThree: 'Manager',
      usernameOne: 'snewco',
      usernameTwo: 'tbillups',
      usernameThree: 'alevier',
      emailOne: 'snewco@gmail.com',
      emailTwo: 'tbillups@gmail.com',
      emailThree: 'alevier@aol.com',
      personListTwo: '139543cf-8fea-426a-8bc3-09778cd79902',
      inherited: {
        /* no value field if not present */
        auth_amount: {
          inherited_value: BSRS_PERSON_AUTH_AMOUNT,
          inherits_from: 'role',
          inherits_from_id: this.role_defaults.idOne
        },
        auth_currency: {
          inherited_value: this.currency_defaults.id,
          inherits_from: 'role',
          inherits_from_id: this.role_defaults.idOne
        }
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var role_defaults = require('./role');
  var status_defaults = require('./status');
  var currency_defaults = require('./currency');
  var locale_defaults = require('./locale');
  module.exports = new BSRS_PERSON_DEFAULTS_OBJECT(role_defaults, status_defaults, currency_defaults, locale_defaults).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/person', ['exports',
      'bsrs-ember/vendor/defaults/role',
      'bsrs-ember/vendor/defaults/status',
      'bsrs-ember/vendor/defaults/currency',
      'bsrs-ember/vendor/defaults/locale'
    ],
    function(exports, role_defaults, status_defaults, currency_defaults, locale_defaults) {
      'use strict';
      return new BSRS_PERSON_DEFAULTS_OBJECT(role_defaults, status_defaults, currency_defaults, locale_defaults).defaults();
    });
}
