import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_URL = '/admin/locations';
const LOCATION_NEW_URL = LOCATION_URL + '/new';
const DJANGO_LOCATION_URL = PREFIX + '/admin/locations/';
const DETAIL_URL = LOCATION_URL + '/' + LOCATION_DEFAULTS.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_URL + LOCATION_DEFAULTS.idOne + '/';
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

var application, store, payload;

module('sco Acceptance | location-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        xhr(DJANGO_LOCATION_URL, "GET", null, {}, 200, LOCATION_FIXTURES.empty());
        payload = {
            id: UUID.value,
            name: LOCATION_DEFAULTS.storeName,
            number: LOCATION_DEFAULTS.storeNumber,
            children: []
        };
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
    }
});

test('visiting /location/new', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(LOCATION_URL);
    click('.t-location-new');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(store.find('location').get('length'), 1);
    });
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeName);
    fillIn('.t-location-number', LOCATION_DEFAULTS.storeNumber);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('location').get('length'), 1);
        var location = store.find('location', UUID.value);
        assert.equal(location.get('id'), UUID.value);
        assert.equal(location.get('name'), LOCATION_DEFAULTS.storeName);
        assert.ok(location.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(LOCATION_URL);
    click('.t-location-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
    });
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeName);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.ok(find('.t-number-validation-error').is(':visible'));
    });
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeName);
    fillIn('.t-location-number', LOCATION_DEFAULTS.storeNumber);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeName);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-location-name').val(), LOCATION_DEFAULTS.storeName);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeName);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            var location = store.find('location', {id: UUID.value});
            assert.equal(location.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var location = store.find('location', {id: UUID.value});
            assert.equal(location.get('length'), 0);
            assert.equal(find('tr.t-location-data').length, 0);
        });
    });
});

