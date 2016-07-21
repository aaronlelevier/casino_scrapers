import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/status';
import STORE_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/location-status';
import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import CD from 'bsrs-ember/vendor/defaults/category';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number-type';
import ED from 'bsrs-ember/vendor/defaults/email-type';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/ticket';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LOCALE_DEFAULTS from 'bsrs-ember/vendor/defaults/locale';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const HOME_URL = '/';
const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

var application, store, run = Ember.run;

moduleForAcceptance('Acceptance | bootup test', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach() {
    store = null;
    
  }
});

test('on boot we should fetch and load the email configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('email-type').get('length'), 2);
    assert.equal(store.find('email-type').objectAt(0).get('id'), ED.workId);
    assert.equal(store.find('email-type').objectAt(0).get('name'), ED.workEmail);
    assert.equal(store.find('email-type').objectAt(1).get('id'), ED.personalId);
    assert.equal(store.find('email-type').objectAt(1).get('name'), ED.personalEmail);
  });
});

test('on boot we should fetch and load the phone number configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('phone-number-type').get('length'), 2);
    assert.equal(store.find('phone-number-type').objectAt(0).get('id'), PND.officeId);
    assert.equal(store.find('phone-number-type').objectAt(0).get('name'), PND.officeName);
    assert.equal(store.find('phone-number-type').objectAt(1).get('id'), PND.mobileId);
    assert.equal(store.find('phone-number-type').objectAt(1).get('name'), PND.mobileName);
  });
});

test('on boot we should fetch and load the address configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('address-type').get('length'), 2);
    assert.equal(store.find('address-type').objectAt(0).get('id'), ATD.officeId);
    assert.equal(store.find('address-type').objectAt(0).get('name'), ATD.officeName);
    assert.equal(store.find('address-type').objectAt(1).get('id'), ATD.shippingId);
    assert.equal(store.find('address-type').objectAt(1).get('name'), ATD.shippingName);
  });
});

test('on boot we should fetch and load the country configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('country').get('length'), 2);
    assert.equal(store.find('country').objectAt(0).get('id'), COUNTRY_DEFAULTS.id);
    assert.equal(store.find('country').objectAt(0).get('name'), COUNTRY_DEFAULTS.name);
    assert.equal(store.find('country').objectAt(1).get('id'), COUNTRY_DEFAULTS.idTwo);
    assert.equal(store.find('country').objectAt(1).get('name'), COUNTRY_DEFAULTS.nameTwo);
  });
});

test('on boot we should fetch and load the state configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('state').get('length'), 51);
    assert.equal(store.find('state').objectAt(4).get('id'), STATE_DEFAULTS.id);
    assert.equal(store.find('state').objectAt(4).get('name'), STATE_DEFAULTS.name);
    assert.equal(store.find('state').objectAt(4).get('abbr'), STATE_DEFAULTS.abbr);
  });
});

test('on boot we should fetch and load the person status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('status').get('length'), 3);
    assert.equal(store.find('status').objectAt(0).get('id'), STATUS_DEFAULTS.activeId);
    assert.equal(store.find('status').objectAt(0).get('name'), STATUS_DEFAULTS.activeName);
    assert.equal(store.find('status').objectAt(1).get('id'), STATUS_DEFAULTS.inactiveId);
    assert.equal(store.find('status').objectAt(1).get('name'), STATUS_DEFAULTS.inactiveName);
    assert.equal(store.find('status').objectAt(2).get('id'), STATUS_DEFAULTS.expiredId);
    assert.equal(store.find('status').objectAt(2).get('name'), STATUS_DEFAULTS.expiredName);
  });
});

test('on boot we should fetch and load the store status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('location-status').get('length'), 3);
    assert.equal(store.find('location-status').objectAt(0).get('id'), STORE_STATUS_DEFAULTS.openId);
    assert.equal(store.find('location-status').objectAt(0).get('name'), STORE_STATUS_DEFAULTS.openName);
    assert.equal(store.find('location-status').objectAt(1).get('id'), STORE_STATUS_DEFAULTS.closedId);
    assert.equal(store.find('location-status').objectAt(1).get('name'), STORE_STATUS_DEFAULTS.closedName);
    assert.equal(store.find('location-status').objectAt(2).get('id'), STORE_STATUS_DEFAULTS.futureId);
    assert.equal(store.find('location-status').objectAt(2).get('name'), STORE_STATUS_DEFAULTS.futureName);
  });
});

test('on boot we should fetch and load the ticket status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('ticket-status').get('length'), 8);
    assert.equal(store.find('ticket-status').objectAt(0).get('id'), LD.statusOneId);
    assert.equal(store.find('ticket-status').objectAt(0).get('name'), LD.statusOneKey);
    assert.equal(store.find('ticket-status').objectAt(1).get('id'), LD.statusTwoId);
    assert.equal(store.find('ticket-status').objectAt(1).get('name'), LD.statusTwoKey);
    assert.equal(store.find('ticket-status').objectAt(2).get('id'), LD.statusThreeId);
    assert.equal(store.find('ticket-status').objectAt(2).get('name'), LD.statusThreeKey);
    assert.equal(store.find('ticket-status').objectAt(3).get('id'), LD.statusFourId);
    assert.equal(store.find('ticket-status').objectAt(3).get('name'), LD.statusFourKey);
    assert.equal(store.find('ticket-status').objectAt(4).get('id'), LD.statusFiveId);
    assert.equal(store.find('ticket-status').objectAt(4).get('name'), LD.statusFiveKey);
    assert.equal(store.find('ticket-status').objectAt(5).get('id'), LD.statusSixId);
    assert.equal(store.find('ticket-status').objectAt(5).get('name'), LD.statusSixKey);
    assert.equal(store.find('ticket-status').objectAt(6).get('id'), LD.statusSevenId);
    assert.equal(store.find('ticket-status').objectAt(6).get('name'), LD.statusSevenKey);
    assert.equal(store.find('ticket-status').objectAt(7).get('id'), LD.statusEightId);
    assert.equal(store.find('ticket-status').objectAt(7).get('name'), LD.statusEightKey);
  });
});

test('on boot we should fetch and load the ticket priority configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(store.find('ticket-priority').get('length'), 4);
    assert.equal(store.find('ticket-priority').objectAt(0).get('id'), LD.priorityOneId);
    assert.equal(store.find('ticket-priority').objectAt(0).get('name'), LD.priorityOneKey);
    assert.equal(store.find('ticket-priority').objectAt(1).get('id'), LD.priorityTwoId);
    assert.equal(store.find('ticket-priority').objectAt(1).get('name'), LD.priorityTwoKey);
    assert.equal(store.find('ticket-priority').objectAt(2).get('id'), LD.priorityThreeId);
    assert.equal(store.find('ticket-priority').objectAt(2).get('name'), LD.priorityThreeKey);
    assert.equal(store.find('ticket-priority').objectAt(3).get('id'), LD.priorityFourId);
    assert.equal(store.find('ticket-priority').objectAt(3).get('name'), LD.priorityFourKey);
  });
});

test('on boot we should fetch and load the currency configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var currency_models = store.find('currency');
    assert.equal(currency_models.get('length'), 4);
    assert.equal(currency_models.objectAt(0).get('id'), CURRENCY_DEFAULTS.id);
    assert.equal(currency_models.objectAt(0).get('symbol'), CURRENCY_DEFAULTS.symbol);
    assert.equal(currency_models.objectAt(0).get('decimal_digits'), CURRENCY_DEFAULTS.decimal_digits);
    assert.equal(currency_models.objectAt(0).get('code'), CURRENCY_DEFAULTS.code);
    assert.equal(currency_models.objectAt(0).get('symbol_native'), CURRENCY_DEFAULTS.symbol_native);
    assert.equal(currency_models.objectAt(0).get('rounding'), CURRENCY_DEFAULTS.rounding);
    assert.equal(currency_models.objectAt(0).get('name_plural'), CURRENCY_DEFAULTS.name_plural);
    assert.equal(currency_models.objectAt(0).get('name'), CURRENCY_DEFAULTS.name);
  });
});

test('on boot we should fetch and load the role configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var role_models = store.find('role');
    var category_models = store.find('category');
    assert.equal(role_models.get('length'), 6);
    assert.equal(role_models.objectAt(0).get('id'), RD.idOne);
    assert.equal(role_models.objectAt(0).get('name'), RD.nameOne);
    assert.equal(role_models.objectAt(0).get('location_level').get('id'), LLD.idOne);
    assert.equal(role_models.objectAt(0).get('location_level').get('name'), LLD.nameCompany);
    assert.equal(role_models.objectAt(0).get('role_type'), RD.t_roleTypeGeneral);
    assert.equal(role_models.objectAt(0).get('location_level').get('id'), LLD.idOne);
    assert.equal(role_models.objectAt(1).get('location_level').get('id'), LLD.idDistrict);
    assert.equal(role_models.objectAt(2).get('location_level').get('id'), LLD.idThree);
    assert.equal(role_models.objectAt(3).get('location_level').get('id'), LLD.idStore);
  });
});

test('on boot we should fetch and load the role types configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var role_types_models = store.find('role-type');
    assert.equal(role_types_models.get('length'), 2);
    assert.ok(role_types_models.objectAt(0).get('id') > 0);
    assert.equal(role_types_models.objectAt(0).get('name'), RD.t_roleTypeGeneral);
  });
});

test('on boot we should fetch and load the location level configuration', function(assert) {
  run(function() {
    store.clear('location-level');
  });
  visit(HOME_URL);
  andThen(() => {
    var location_level_models = store.find('location-level');
    assert.equal(location_level_models.get('length'), 8);
    assert.equal(location_level_models.objectAt(0).get('id'), LLD.idOne);
    assert.equal(location_level_models.objectAt(0).get('name'), LLD.nameCompany);
  });
});

test('locale', assert => {
  visit(HOME_URL);
  andThen(() => {
    var locale = store.findOne('locale');
    assert.equal(locale.get('id'), LOCALE_DEFAULTS.idOne);
    assert.equal(locale.get('name'), LOCALE_DEFAULTS.nameOneKey);
    assert.equal(locale.get('locale'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('native_name'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('presentation_name'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('rtl'), LOCALE_DEFAULTS.rtlOne);
    assert.equal(locale.get('default'), LOCALE_DEFAULTS.defaultOne);
  });
});

test('on boot we should fetch and load the person-current, logged in Person, configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var person_current = store.findOne('person');
    assert.equal(person_current.get('id'), PERSON_CURRENT.id);
    assert.equal(person_current.get('first_name'), PERSON_CURRENT.first_name);
    assert.equal(person_current.get('last_name'), PERSON_CURRENT.last_name);
    assert.equal(person_current.get('username'), PERSON_CURRENT.username);
    assert.equal(person_current.get('title'), PERSON_CURRENT.title);
    assert.equal(person_current.get('status.id'), PERSON_CURRENT.status);
    assert.equal(person_current.get('role.id'), store.find('person', PERSON_CURRENT.id).get('role').get('id'));
    assert.equal(person_current.get('locale.id'), PERSON_CURRENT.locale);
    assert.deepEqual(person_current.get('inherited'), PERSON_CURRENT.inherited);
  });
});

test('on boot we should fetch and load the default model ordering configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var model_ordering = store.find('model-ordering');
    assert.equal(model_ordering.get('length'), 1);
    assert.equal(model_ordering.objectAt(0).get('id'), 'admin.people.index');
    assert.deepEqual(model_ordering.objectAt(0).get('order'), ['fullname']);
  });
});

test('on boot we should fetch and load the saved filterset configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    var filtersets = store.find('filterset');
    assert.equal(filtersets.get('length'), 7);
    assert.equal(filtersets.objectAt(0).get('endpoint_name'), 'tickets.index');
    assert.deepEqual(filtersets.objectAt(0).get('endpoint_uri'), '?sort=assignee.fullname');
  });
});
