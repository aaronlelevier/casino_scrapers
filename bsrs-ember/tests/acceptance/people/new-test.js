import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + UUID.value;
const PEOPLE_NEW_URL = BASE_PEOPLE_URL + '/new';

var application, store, payload, detail_xhr, list_xhr, original_uuid;

module('Acceptance | people-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            username: PEOPLE_DEFAULTS.username,
            password: PEOPLE_DEFAULTS.password,
            role: PEOPLE_DEFAULTS.role,
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + BASE_PEOPLE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1','GET',null,{},200,PEOPLE_FIXTURES.empty());
        var detailEndpoint = PREFIX + BASE_PEOPLE_URL + '/';
        var people_detail_data = {id: UUID.value, username: PEOPLE_DEFAULTS.username,
            role: ROLE_FIXTURES.get() , phone_numbers:[], addresses: [], locations: []};
        detail_xhr = xhr(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        payload = null;
        detail_xhr = null;
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new and creating a new person', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_PEOPLE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(PEOPLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.equal(store.find('person').get('length'), 2);
        assert.equal(find('.t-person-role-select option:eq(0)').text(), 'Select One');
        var person = store.find('person').objectAt(1);
        assert.ok(person.get('new'));
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-role-select', PEOPLE_DEFAULTS.role);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(store.find('person').get('length'), 2);
        var person = store.find('person').objectAt(1);
        assert.equal(person.get('id'), UUID.value);
        assert.equal(person.get('new'), undefined);
        assert.equal(person.get('username'), PEOPLE_DEFAULTS.username);
        assert.equal(person.get('password'), '');
        assert.equal(person.get('role').get('id'), PEOPLE_DEFAULTS.role);
        assert.ok(person.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    var url = PREFIX + BASE_PEOPLE_URL + '/';
    xhr( url,'POST',JSON.stringify(payload),{},201,response );
    visit(PEOPLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':hidden'));
        assert.ok(find('.t-password-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':visible'));
        assert.ok(find('.t-password-validation-error').is(':visible'));
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-username-validation-error').is(':hidden'));
    });
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-role-select', PEOPLE_DEFAULTS.role);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(detail_xhr);
    clearxhr(list_xhr);
    visit(PEOPLE_NEW_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS.username);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    clearxhr(detail_xhr);
    visit(PEOPLE_NEW_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 0);
            assert.equal(find('tr.t-grid-data').length, 1);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    clearxhr(detail_xhr);
    visit(PEOPLE_NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('person').get('length'), 1);
    });
});
