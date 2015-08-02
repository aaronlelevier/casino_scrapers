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

const PREFIX = config.APP.NAMESPACE;
const ROLE_URL = '/admin/roles';
const ROLE_NEW_URL = ROLE_URL + '/new';
const SAVE_BTN = '.t-save-btn' ;

var application, store, payload;

module('Acceptance | role-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: ROLE_DEFAULTS.name,
            role_type: ROLE_DEFAULTS.roleTypeGeneral,
            location_level: ROLE_DEFAULTS.locationLevel,
            categories: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + ROLE_URL + '/';
        xhr(endpoint, 'GET', null, {}, 200, ROLE_FIXTURES.empty());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting role/new', (assert) => {
    visit(ROLE_URL);
    var response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + ROLE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    click('.t-role-new');
    andThen(() => {
        assert.equal(currentURL(), ROLE_NEW_URL);
        assert.equal(store.find('role').get('length'), 1);
        assert.equal(store.find('role-type').get('length'), 2);
        assert.ok(store.find('role').objectAt(0).get('isNotDirty'));
    });
    fillIn('.t-role-name', ROLE_DEFAULTS.name);
    fillIn('.t-role-role_type', ROLE_DEFAULTS.roleTypeGeneral);
    fillIn('.t-role-location_level', ROLE_DEFAULTS.locationLevel);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role').get('length'), 1);
        var role = store.find('role').objectAt(0);
        assert.equal(role.get('name'), ROLE_DEFAULTS.name);
        assert.equal(role.get('role_type'), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(role.get('location_level'), ROLE_DEFAULTS.locationLevel);
        assert.ok(role.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + ROLE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(ROLE_URL);
    click('.t-role-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-role_type-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-role_type-validation-error').is(':visible'));
    });
    fillIn('.t-role-name', ROLE_DEFAULTS.name);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
    });
    fillIn('.t-role-role_type', ROLE_DEFAULTS.roleTypeGeneral);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_NEW_URL);
        assert.ok(find('.t-role_type-validation-error').is(':hidden'));
        assert.ok(find('.t-location_level-validation-error').is(':visible'));
    });
    fillIn('.t-role-location_level', ROLE_DEFAULTS.locationLevel);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('sco when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    visit(ROLE_NEW_URL);
    fillIn('.t-role-name', ROLE_DEFAULTS.name);
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
            assert.equal(find('.t-role-name').val(), ROLE_DEFAULTS.name);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

// test('sco when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
//     visit(ROLE_NEW_URL);
//     fillIn('.t-role-name', ROLE_DEFAULTS.name);
//     click('.t-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), ROLE_NEW_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//             var role = store.find('role', {id: UUID.value});
//             assert.equal(role.get('length'), 1);
//         });
//     });
//     click('.t-modal-footer .t-modal-rollback-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), ROLE_URL);
//             assert.equal(find('.t-modal').is(':hidden'), true);
//             var role = store.find('role', {id: UUID.value});
//             assert.equal(role.get('length'), 0);
//         });
//     });
// });
