import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import PhoneNumberDefaults from 'bsrs-ember/value-defaults/phone-number-type';

const HOME_URL = '/';

var application, store;

module('Acceptance | bootup test', {
    beforeEach: function() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach: function() {
        store = null;
        Ember.run(application, 'destroy');
    }
});

test('on boot we should fetch and load the phone number types', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(store.find('phone-number-type').length, 2);
        assert.equal(store.find('phone-number-type').objectAt(0).get('id'), PhoneNumberDefaults.officeType);
        assert.equal(store.find('phone-number-type').objectAt(0).get('name'), PhoneNumberDefaults.officeName);
        assert.equal(store.find('phone-number-type').objectAt(1).get('id'), PhoneNumberDefaults.mobileType);
        assert.equal(store.find('phone-number-type').objectAt(1).get('name'), PhoneNumberDefaults.mobileName);
    });
});
