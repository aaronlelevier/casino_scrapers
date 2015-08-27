import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/status';
import STORE_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/location-status';
import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import ADDRESS_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import PHONE_NUMBER_DEFAULT from 'bsrs-ember/vendor/defaults/phone-number-type';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import BSRS_PERSON_CURRENT_DEFAULTS_OBJECT from 'bsrs-ember/vendor/defaults/person-current';

const HOME_URL = '/';

var application, store;

module('Acceptance | bootup test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach() {
        store = null;
        Ember.run(application, 'destroy');
    }
});

test('on boot we should fetch and load the phone number configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('phone-number-type').get('length'), 2);
        assert.equal(store.find('phone-number-type').objectAt(0).get('id'), PHONE_NUMBER_DEFAULT.officeId);
        assert.equal(store.find('phone-number-type').objectAt(0).get('name'), PHONE_NUMBER_DEFAULT.officeName);
        assert.equal(store.find('phone-number-type').objectAt(1).get('id'), PHONE_NUMBER_DEFAULT.mobileId);
        assert.equal(store.find('phone-number-type').objectAt(1).get('name'), PHONE_NUMBER_DEFAULT.mobileName);
    });
});

test('on boot we should fetch and load the address configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('address-type').get('length'), 2);
        assert.equal(store.find('address-type').objectAt(0).get('id'), ADDRESS_TYPE_DEFAULTS.officeId);
        assert.equal(store.find('address-type').objectAt(0).get('name'), ADDRESS_TYPE_DEFAULTS.officeName);
        assert.equal(store.find('address-type').objectAt(1).get('id'), ADDRESS_TYPE_DEFAULTS.shippingId);
        assert.equal(store.find('address-type').objectAt(1).get('name'), ADDRESS_TYPE_DEFAULTS.shippingName);
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
        assert.equal(role_models.get('length'), 3);
        assert.equal(role_models.objectAt(0).get('id'), ROLE_DEFAULTS.idOne);
        assert.equal(role_models.objectAt(0).get('name'), t(ROLE_DEFAULTS.nameOne));
        assert.equal(role_models.objectAt(0).get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(role_models.objectAt(0).get('location_level').get('name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
        assert.equal(role_models.objectAt(0).get('role_type'), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(role_models.objectAt(2).get('location_level'), undefined);
    });
});

test('on boot we should fetch and load the role types configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        var role_types_models = store.find('role-type');
        assert.equal(role_types_models.get('length'), 2);
        assert.ok(role_types_models.objectAt(0).get('id') > 0);
        assert.equal(role_types_models.objectAt(0).get('name'), ROLE_DEFAULTS.roleTypeGeneral);
    });
});

test('on boot we should fetch and load the location level configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        var location_level_models = store.find('location-level');
        assert.equal(location_level_models.get('length'), 2);
        assert.equal(location_level_models.objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(location_level_models.objectAt(0).get('name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
});

test('on boot we should fetch and load the current person configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        var person_current_model = store.findOne('person-current');
        assert.equal(person_current_model.get('id'), BSRS_PERSON_CURRENT_DEFAULTS_OBJECT.id);
        assert.equal(person_current_model.get('first_name'), BSRS_PERSON_CURRENT_DEFAULTS_OBJECT.first_name);
        assert.equal(person_current_model.get('last_name'), BSRS_PERSON_CURRENT_DEFAULTS_OBJECT.last_name);
    });
});
