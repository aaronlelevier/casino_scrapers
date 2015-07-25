import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import StatusDefaults from 'bsrs-ember/vendor/defaults/status';
import StateDefaults from 'bsrs-ember/vendor/defaults/state';
import CountryDefaults from 'bsrs-ember/vendor/defaults/country';
import AddressTypeDefaults from 'bsrs-ember/vendor/defaults/address-type';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';
import CurrencyDefaults from 'bsrs-ember/vendor/currencies';

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
        assert.equal(store.find('phone-number-type').length, 2);
        assert.equal(store.find('phone-number-type').objectAt(0).get('id'), PhoneNumberDefaults.officeType);
        assert.equal(store.find('phone-number-type').objectAt(0).get('name'), PhoneNumberDefaults.officeName);
        assert.equal(store.find('phone-number-type').objectAt(1).get('id'), PhoneNumberDefaults.mobileType);
        assert.equal(store.find('phone-number-type').objectAt(1).get('name'), PhoneNumberDefaults.mobileName);
    });
});

test('on boot we should fetch and load the address configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('address-type').length, 2);
        assert.equal(store.find('address-type').objectAt(0).get('id'), AddressTypeDefaults.officeType);
        assert.equal(store.find('address-type').objectAt(0).get('name'), AddressTypeDefaults.officeName);
        assert.equal(store.find('address-type').objectAt(1).get('id'), AddressTypeDefaults.shippingType);
        assert.equal(store.find('address-type').objectAt(1).get('name'), AddressTypeDefaults.shippingName);
    });
});

test('on boot we should fetch and load the country configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('country').length, 1);
        assert.equal(store.find('country').objectAt(0).get('id'), CountryDefaults.firstId);
        assert.equal(store.find('country').objectAt(0).get('name'), CountryDefaults.firstName);
    });
});

test('on boot we should fetch and load the state configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('state').length, 51);
        assert.equal(store.find('state').objectAt(4).get('id'), StateDefaults.firstId);
        assert.equal(store.find('state').objectAt(4).get('name'), StateDefaults.firstName);
        assert.equal(store.find('state').objectAt(4).get('abbr'), StateDefaults.firstAbbr);
    });
});

test('on boot we should fetch and load the status configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('status').length, 3);
        assert.equal(store.find('status').objectAt(0).get('id'), StatusDefaults.activeId);
        assert.equal(store.find('status').objectAt(0).get('name'), StatusDefaults.activeName);
        assert.equal(store.find('status').objectAt(1).get('id'), StatusDefaults.inactiveId);
        assert.equal(store.find('status').objectAt(1).get('name'), StatusDefaults.inactiveName);
        assert.equal(store.find('status').objectAt(2).get('id'), StatusDefaults.expiredId);
        assert.equal(store.find('status').objectAt(2).get('name'), StatusDefaults.expiredName);
    });
});

test('on boot we should fetch and load the currency configuration', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        var currency_models = store.find('currency');
        assert.equal(currency_models.length, 4);
        assert.equal(currency_models.objectAt(0).get('id'), CurrencyDefaults.id);
        assert.equal(currency_models.objectAt(0).get('symbol'), CurrencyDefaults.symbol);
        assert.equal(currency_models.objectAt(0).get('decimal_digits'), CurrencyDefaults.decimal_digits);
        assert.equal(currency_models.objectAt(0).get('code'), CurrencyDefaults.code);
        assert.equal(currency_models.objectAt(0).get('symbol_native'), CurrencyDefaults.symbol_native);
        assert.equal(currency_models.objectAt(0).get('rounding'), CurrencyDefaults.rounding);
        assert.equal(currency_models.objectAt(0).get('name_plural'), CurrencyDefaults.name_plural);
        assert.equal(currency_models.objectAt(0).get('name'), CurrencyDefaults.name);
    });
});
