import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const ROLE_NEW_URL = BASE_URL + '/new';
const SAVE_BTN = '.t-save-btn' ;

let application, store, payload, list_xhr;

module('Acceptance | role-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: ROLE_DEFAULTS.nameOne,
            role_type: ROLE_DEFAULTS.roleTypeGeneral,
            location_level: ROLE_DEFAULTS.locationLevelOne,
            categories: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ROLE_FIXTURES.empty());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting role/new', (assert) => {
    visit(ROLE_URL);
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), ROLE_NEW_URL);
        assert.equal(store.find('role').get('length'), 4);
        assert.equal(store.find('role-type').get('length'), 2);
        assert.equal(store.find('location-level').get('length'), 8);
        assert.equal(find('.t-location-level option:selected').text(), 'Select One');
        assert.equal(find('.t-location-level option:eq(1)').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
        assert.equal(find('.t-location-level option:eq(2)').text(), LOCATION_LEVEL_DEFAULTS.nameRegion);
        assert.equal(find('.t-role-type option:selected').text(), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(find('.t-role-type option:eq(0)').text(), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(find('.t-role-type option:eq(1)').text(), ROLE_DEFAULTS.roleTypeContractor);
        assert.ok(store.find('role').objectAt(1).get('isNotDirty'));
    });
    fillIn('.t-role-name', ROLE_DEFAULTS.nameOne);
    fillIn('.t-role-type', ROLE_DEFAULTS.roleTypeGeneral);
    fillIn('.t-location-level', ROLE_DEFAULTS.locationLevelOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role').get('length'), 4);
        let role = store.find('role', UUID.value);
        assert.equal(role.get('name'), ROLE_DEFAULTS.nameOne);
        assert.equal(role.get('role_type'), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(role.get('location_level.id'), ROLE_DEFAULTS.locationLevelOne);
        assert.ok(role.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    payload.location_level = null;
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(ROLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
    });
    fillIn('.t-role-name', ROLE_DEFAULTS.nameOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(ROLE_NEW_URL);
    fillIn('.t-role-name', ROLE_DEFAULTS.nameOne);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_NEW_URL);
            assert.equal(find('.t-role-name').val(), ROLE_DEFAULTS.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(ROLE_NEW_URL);
    fillIn('.t-role-name', ROLE_DEFAULTS.nameOne);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let role = store.find('role', {id: UUID.value});
            assert.equal(role.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_URL);
            let role = store.find('role', {id: UUID.value});
            assert.equal(role.get('length'), 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(ROLE_NEW_URL);
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(store.find('role').get('length'), 3);
    });
});
