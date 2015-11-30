import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/role';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const LOCATIONLEVELCLEAR = '.t-location-level-select > .ember-power-select-trigger > .ember-power-select-clear-btn';

let application, store, payload, list_xhr, original_uuid, url;

module('Acceptance | role-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: RD.nameOne,
            role_type: RD.roleTypeGeneral,
            location_level: RD.locationLevelOne,
            categories: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.empty());
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
        url = `${PREFIX}${BASE_URL}/`;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting role/new', (assert) => {
    visit(ROLE_URL);
    let response = Ember.$.extend(true, {}, payload);
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        assert.equal(store.find('role').get('length'), 4);
        assert.equal(store.find('role-type').get('length'), 2);
        assert.equal(store.find('location-level').get('length'), 8);
        assert.equal(page.locationLevelInput(), 'Select One');
        assert.equal(page.roleTypeInput(), RD.roleTypeGeneral);
        assert.ok(store.find('role').objectAt(1).get('isNotDirty'));
        const role = store.find('role', UUID.value);
        assert.ok(role.get('new'));
    });
    fillIn('.t-role-name', RD.nameOne);
    page.roleTypeClickDropdown();
    page.roleTypeClickOptionOne();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role').get('length'), 4);
        let role = store.find('role', UUID.value);
        assert.equal(role.get('new'), undefined);
        assert.equal(role.get('name'), RD.nameOne);
        assert.equal(role.get('role_type'), RD.roleTypeGeneral);
        assert.equal(role.get('location_level.id'), RD.locationLevelOne);
        assert.ok(role.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(ROLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    fillIn('.t-role-name', RD.nameOne);
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    let response = Ember.$.extend(true, {}, payload);
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-role-name').val(), RD.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
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
    visit(NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('role').get('length'), 3);
    });
});

/* ROLE TO LOCATION LEVEL */
test('can save new location level', (assert) => {
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        let role = store.find('role', RD.idOne); 
        assert.equal(role.get('location_level').get('id'), LLD.idOne);
        assert.equal(role.get('location_level_fk'), LLD.idOne);
    });
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});
