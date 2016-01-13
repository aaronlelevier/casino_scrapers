import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const LOCATION_NEW_URL = BASE_URL + '/new/1';
const DJANGO_LOCATION_URL = PREFIX + '/admin/locations/';
const DETAIL_URL = BASE_URL + '/' + LD.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_URL + LD.idOne + '/';

let application, store, payload, list_xhr, original_uuid;

module('Acceptance | location-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(DJANGO_LOCATION_URL + '?page=1', "GET", null, {}, 200, LOCATION_FIXTURES.empty());
        payload = {
            id: UUID.value,
            name: LD.storeName,
            number: LD.storeNumber,
            location_level: LLD.idOne,
            children: [],
            parents: [],
            emails: [],
            phone_numbers: [],
            addresses: []
        };
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        payload = null;
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting /location/new', (assert) => {
    visit(LOCATION_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(store.find('location').get('length'), 2);
        const location = store.find('location', UUID.value);
        assert.ok(location.get('new'));
        assert.notOk(location.get('name'));
        assert.notOk(location.get('number'));
    });
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        assert.equal(page.locationLevelInput().split(' +')[0].split(' ')[0], LLD.nameCompany);
    });
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('location').get('length'), 2);
        let location = store.find('location', UUID.value);
        assert.equal(location.get('new'), undefined);
        assert.equal(location.get('name'), LD.storeName);
        assert.equal(location.get('number'), LD.storeNumber);
        assert.equal(location.get('location_level').get('id'), LLD.idOne);
        assert.equal(location.get('location_level_fk'), LLD.idOne);
        assert.ok(location.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(LOCATION_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    fillIn('.t-location-name', LD.storeName);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    fillIn('.t-location-number', LD.storeNumber);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
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
            assert.equal(find('.t-location-name').val(), LD.storeName);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 2);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
            assert.equal(find('tr.t-grid-data').length, 1);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(LOCATION_NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('location').get('length'), 1);
    });
});
