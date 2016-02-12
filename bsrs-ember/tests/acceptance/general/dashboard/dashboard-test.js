import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';

var application, store, endpoint;

module('Acceptance | dashboard', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('welcome h1 header', function(assert) {
    visit('/dashboard');
    andThen(() => {
        assert.equal(find('.t-admin-h1').text(), 'Welcome');
    });
});