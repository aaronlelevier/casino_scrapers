import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const LOCATION_LEVEL_NEW_URL = BASE_URL + '/new';
const DJANGO_LOCATION_LEVEL_URL = PREFIX + '/admin/location_levels/';
const DETAIL_URL = BASE_URL + '/' + LOCATION_LEVEL_DEFAULTS.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_LEVEL_URL + LOCATION_LEVEL_DEFAULTS.idOne + '/';
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

let application, store, payload, list_xhr;

module('Acceptance | location-level-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(DJANGO_LOCATION_LEVEL_URL, "GET", null, {}, 200, LOCATION_LEVEL_FIXTURES.empty());
        payload = {
            id: UUID.value,
            name: LOCATION_LEVEL_DEFAULTS.nameAnother,
            children: LOCATION_LEVEL_DEFAULTS.newTemplateChildren
        };
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
    }
});

test('visiting /location-level/new', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_LEVEL_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(LOCATION_LEVEL_URL);
    click('.t-location-level-new');
    click('.selectize-input input');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    click('.t-location-level-location-level-select div.option:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
        assert.equal(store.find('location-level').get('length'), 9);
        assert.equal(find('.t-location-level-location-level-select > option').length, 8);
    });
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameAnother);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(store.find('location-level').get('length'), 9);
        let locationLevel = store.find('location-level', UUID.value);
        assert.equal(locationLevel.get('id'), UUID.value);
        assert.equal(locationLevel.get('name'), LOCATION_LEVEL_DEFAULTS.nameAnother);
        assert.ok(locationLevel.get('notDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    payload.name = LOCATION_LEVEL_DEFAULTS.nameRegion;
    payload.children = [];
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_LEVEL_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(LOCATION_LEVEL_URL);
    click('.t-location-level-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(LOCATION_LEVEL_NEW_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
            assert.equal(find('.t-location-level-name').val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(LOCATION_LEVEL_NEW_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let location_level = store.find('location-level', {id: UUID.value});
            assert.equal(location_level.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            let location_level = store.find('location-level', {id: UUID.value});
            assert.equal(location_level.get('length'), 0);
            assert.equal(find('tr.t-location-level-data').length, 8);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(LOCATION_LEVEL_NEW_URL);
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(store.find('location-level').get('length'), 8);
    });
});
