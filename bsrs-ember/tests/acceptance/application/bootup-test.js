import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/status';
import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import ADDRESS_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import PHONE_NUMBER_DEFAULT from 'bsrs-ember/vendor/defaults/phone-number-type';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/currencies';

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

test('on boot we should fetch and load the status configuration', function(assert) {
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
        var role_models = store.find('role-type');
        assert.equal(role_models.get('length'), 2);
        assert.equal(role_models.objectAt(0).get('id'), ROLE_DEFAULTS.id);
        assert.equal(role_models.objectAt(0).get('name'), ROLE_DEFAULTS.name);
    });
});
